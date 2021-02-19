import {
  getValueAtPath,
  walk,
  typeOf,
  copy,
  removeNodes,
  last,
  pascalToKebab,
  applyAttribute,
  attributeToProp,
  isPrimitive,
  kebabToPascal,
} from './helpers';
import cloneNode from './cloneNode';
import compareKeyedLists from './compareKeyedLists';

const updateList = (
  template: HTMLTemplateElement,
  binding: ListBinding,
  delta: number[]
) => {
  let listItems = binding.listItems;
  let fragment = document.createDocumentFragment();
  listItems.forEach(removeNodes);

  binding.listItems = delta.map((i, newIndex) => {
    let nodes =
      i === -1
        ? binding.nodes.map((node) => cloneNode(node))
        : listItems[i];

    nodes.forEach((el) => {
      el.__index__ = newIndex;
      fragment.appendChild(el);
    });

    return nodes;
  });
  template.after(fragment);
};

const resolve = (
  path: string,
  ctx: Record<string, number>
) => {
  let parts: (string | number)[] = path.split('.');
  let i = parts.length;
  while (i--) {
    if (parts[i] === '*') {
      parts[i] = ctx[parts.slice(0, i).join('.')];
    }
  }
  return parts.join('.');
};

let getPreviousValue = (
  node: Node,
  binding: TextBinding | AttributeBinding
) =>
  binding.type === Binding.TEXT
    ? node.textContent
    : attributeToProp(
        binding.name,
        node.getAttribute(binding.name)
      ).value;

const getValue = (
  path: string,
  ctx: Record<string, number>,
  target: Record<string, any>,
  binding:
    | ListBinding
    | TextBinding
    | AttributeBinding
    | InputBinding
): any => {
  if (path === '#') return ctx[last(binding.context).prop];

  let negated = path.charAt(0) === '!';

  if (negated) path = path.slice(1);

  let value = getValueAtPath(resolve(path, ctx), target);

  return negated ? !value : value;
};

const parseStyles = (value: any) => {
  let type = typeof value;

  if (type === 'string')
    return value
      .split(';')
      .reduce(
        (o: { [key: string]: string }, value: string) => {
          const [k, v] = value
            .split(':')
            .map((v) => v.trim());
          if (k) o[k] = v;
          return o;
        },
        {}
      );

  if (type === 'object') return value;

  return {};
};

const joinStyles = (value: Record<string, string>) =>
  Object.entries(value)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ');

const mergeStyles = (
  previous: Record<string, string>,
  current: Record<string, string>,
  next: Record<string, string>
) => {
  let o = <Record<string, string>>{};
  //remove previous values, preserving anything else
  for (let k in current) {
    if (!previous[k]) o[k] = current[k];
  }
  //merge everything from next
  for (let k in next) {
    o[k] = next[k];
  }

  return convertStyles(o);
};

const convertStyles = (o: Record<string, any>) =>
  Object.keys(o).reduce((a, k) => {
    a[pascalToKebab(k)] = o[k];
    return a;
  }, <Record<string, any>>{});

const applyComplexAttribute = (
  node: Node,
  name: string,
  value: any,
  previous: string
) => {
  if (name === 'style') {
    value = joinStyles(
      mergeStyles(
        parseStyles(previous),
        parseStyles(node.getAttribute('style')),
        parseStyles(value)
      )
    );
  }

  if (name === 'class') {
    switch (typeOf(value)) {
      case 'Array':
        value = value.join(' ');
        break;
      case 'Object':
        value = Object.keys(value)
          .reduce((a: string[], k: string) => {
            if (value[k]) a.push(k);
            return a;
          }, [])
          .join(' ');
        break;
    }
  }

  if (!isPrimitive(value)) {
    return (node[kebabToPascal(name)] = value);
  }

  applyAttribute(node, name, value);
};

const updateBinding = (
  binding: BindingType,
  node: Node,
  ctx: Record<string, number>,
  p: Record<string, any>
) => {
  switch (binding.type) {
    case Binding.CALL: {
      return;
    }
    case Binding.SET: {
      return (
        binding.path &&
        (binding.realPath = resolve(binding.path, ctx))
      );
    }
    case Binding.LIST_ITEM: {
      return (ctx[binding.path] = node.__index__);
    }
    case Binding.LIST: {
      let oldValue = binding.data;
      let newValue = getValue(
        binding.path,
        ctx,
        p,
        binding
      );

      let delta = compareKeyedLists(
        binding.uid,
        oldValue,
        newValue
      );

      binding.data = newValue;

      return (
        delta &&
        updateList(
          node as HTMLTemplateElement,
          binding,
          delta
        )
      );
    }
    case Binding.INPUT: {
      const newValue = getValue(
        binding.path,
        ctx,
        p,
        binding
      );

      if (
        node.hasAttribute('multiple') &&
        node.nodeName === 'SELECT'
      ) {
        Array.from(
          (node as HTMLSelectElement).querySelectorAll(
            'option'
          )
        ).forEach((option) => {
          option.selected = newValue.includes(option.value);
        });
        return;
      }

      switch (node.getAttribute('type')) {
        case 'checkbox':
          node.checked = newValue;
          if (node.checked) {
            node.setAttribute('checked', '');
          } else {
            node.removeAttribute('checked');
          }
          break;
        case 'radio':
          node.checked =
            newValue === node.getAttribute('value');
          if (node.checked) {
            node.setAttribute('checked', '');
          } else {
            node.removeAttribute('checked');
          }
          break;
        default:
          node.setAttribute(
            'value',
            (node.value = newValue || '')
          );
          break;
      }

      return;
    }
    default: {
      let oldValue = getPreviousValue(node, binding);

      const newValue = binding.parts.reduce(
        (a, { type, value }) => {
          if (type === 'key') {
            let v = getValue(value, ctx, p, binding);

            if (!a) {
              return v;
            } else {
              return [undefined, null].includes(v)
                ? a
                : a + v;
            }
          } else {
            return a + value;
          }
        },
        ''
      );

      if (newValue === oldValue) return;

      switch (binding.type) {
        case Binding.ATTRIBUTE: {
          applyComplexAttribute(
            node,
            binding.name,
            newValue,
            binding.data
          );
        }
        case Binding.TEXT: {
          node.textContent = newValue;
        }
      }
    }
  }
};

let prev: Record<string, any>;

const Updater = (
  BINDING_ID: number,
  updatedCallback: Function = () => {}
) => (rootNode: Node, viewmodel: Record<string, any>) => {
  let ctx = {};
  let p = copy(viewmodel);

  walk(rootNode, (node: Node) => {
    if (node.bindingId !== BINDING_ID) return;

    let bindings = node.__bindings__;

    if (bindings) {
      bindings.forEach((binding) =>
        updateBinding(binding, node, ctx, p)
      );
    }
  });

  if (prev) updatedCallback(prev);

  prev = p;
};

export default Updater;
