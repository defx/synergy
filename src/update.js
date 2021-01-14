import {
  LIST,
  LIST_ITEM,
  ATTRIBUTE,
  INPUT,
} from './constants.js';
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
} from './helpers.js';
import cloneNode from './cloneNode.js';
import compareKeyedLists from './compareKeyedLists.js';

const updateList = (template, binding, delta) => {
  let listItems = binding.listItems;
  let fragment = document.createDocumentFragment();
  listItems.forEach(removeNodes);

  binding.listItems = delta.map((i, newIndex) => {
    let nodes =
      i === -1
        ? binding.nodes.map((node) => {
            let x = cloneNode(node);

            return x;
          })
        : listItems[i];

    nodes.forEach((el) => {
      el.__index__ = newIndex;
      fragment.appendChild(el);
    });

    return nodes;
  });
  template.after(fragment);
};

const resolve = (path, ctx) => {
  let parts = path.split('.');
  let i = parts.length;
  while (i--) {
    if (parts[i] === '*') {
      parts[i] = ctx[parts.slice(0, i).join('.')];
    }
  }
  return parts.join('.');
};

let getPreviousValue = (node, binding) => {
  switch (binding.type) {
    case 'ATTRIBUTE':
      return attributeToProp(
        binding.name,
        node.getAttribute(binding.name)
      ).value;
    case 'TEXT':
      return node.textContent;
    default:
      return binding.data;
  }
};

const getValue = (path, ctx, target, binding) => {
  if (path === '#') return ctx[last(binding.context).prop];

  let negated = path.charAt(0) === '!';

  if (negated) path = path.slice(1);

  let value = getValueAtPath(resolve(path, ctx), target);

  return negated ? !value : value;
};

const parseStyles = (value) => {
  let type = typeof value;

  if (type === 'string')
    return value.split(';').reduce((o, value) => {
      const [k, v] = value.split(':').map((v) => v.trim());
      if (k) o[k] = v;
      return o;
    }, {});

  if (type === 'object') return value;

  return {};
};

const joinStyles = (value) =>
  Object.entries(value)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ');

const mergeStyles = (previous, current, next) => {
  let o = {};
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

const convertStyles = (o) =>
  Object.keys(o).reduce((a, k) => {
    a[pascalToKebab(k)] = o[k];
    return a;
  }, {});

const applyComplexAttribute = (
  node,
  name,
  value,
  previous
) => {
  if (name === 'style') {
    value = joinStyles(
      mergeStyles(
        parseStyles(previous),
        parseStyles(node.getAttribute('style')),
        parseStyles(value)
      )
    );
  } else if (name === 'class') {
    switch (typeOf(value)) {
      case 'Array':
        value = value.join(' ');
        break;
      case 'Object':
        value = Object.keys(value)
          .reduce((a, k) => {
            if (value[k]) a.push(k);
            return a;
          }, [])
          .join(' ');
        break;
    }
  } else if (!isPrimitive(value)) {
    return (node[kebabToPascal(name)] = value);
  }

  applyAttribute(node, name, value);
};

const updateNode = (node, binding, newValue) =>
  binding.type === ATTRIBUTE
    ? applyComplexAttribute(
        node,
        binding.name,
        newValue,
        binding.data
      )
    : (node.textContent = newValue);

const updateBinding = (binding, node, ctx, p) => {
  if (binding.eventName)
    return (
      binding.path &&
      (binding.realPath = resolve(binding.path, ctx))
    );

  if (binding.type === LIST_ITEM)
    return (ctx[binding.path] = node.__index__);

  let oldValue = getPreviousValue(node, binding);

  if (binding.path) {
    const { path } = binding;
    const newValue = getValue(path, ctx, p, binding);

    binding.data = newValue;

    if (binding.type === LIST) {
      const delta = compareKeyedLists(
        binding.uid,
        oldValue,
        newValue
      );
      return delta && updateList(node, binding, delta);
    }

    if (oldValue === newValue) return;

    if (binding.type === INPUT) {
      if (
        node.hasAttribute('multiple') &&
        node.nodeName === 'SELECT'
      ) {
        Array.from(node.querySelectorAll('option')).forEach(
          (option) => {
            option.selected = newValue.includes(
              option.value
            );
          }
        );
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
  }

  const { parts } = binding;

  const newValue =
    parts.length === 1
      ? getValue(parts[0].value, ctx, p, binding)
      : parts.reduce((a, { type, value }) => {
          if (type === 'key') {
            let v = getValue(value, ctx, p, binding);
            return [undefined, null].includes(v)
              ? a
              : a + v;
          } else {
            return a + value;
          }
        }, '');

  if (newValue === oldValue) return;

  binding.data = newValue;

  updateNode(node, binding, newValue);
};

let prev;

const Updater = (
  BINDING_ID,
  updatedCallback = () => {}
) => (rootNode, viewmodel) => {
  let ctx = {};
  let p = copy(viewmodel);

  walk(rootNode, (node) => {
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
