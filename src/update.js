import {
  LIST,
  LIST_ITEM,
  TEXT,
  ATTRIBUTE,
  ATTRIBUTE_SPREAD,
  INPUT,
} from './constants.js';
import {
  getValueAtPath,
  walk,
  typeOf,
  copy,
  negative,
  removeNodes,
  last,
} from './helpers.js';
import cloneNode from './cloneNode.js';
import compareKeyedLists from './compareKeyedLists.js';

const updateList = (placeholder, binding, delta) => {
  let listItems = binding.listItems;
  let fragment = document.createDocumentFragment();
  listItems.forEach(removeNodes);
  binding.listItems = delta.map((i, newIndex) => {
    let nodes =
      i === -1 ? binding.nodes.map((node) => cloneNode(node)) : listItems[i];

    nodes.forEach((el) => {
      el.__index__ = newIndex;
      fragment.appendChild(el);
    });

    return nodes;
  });
  placeholder.after(fragment);
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

const getValue = (path, ctx, target, binding) => {
  if (path === '.') return ctx[last(binding.context).prop];

  let negated = path.charAt(0) === '!';

  if (negated) path = path.slice(1);

  let value = getValueAtPath(resolve(path, ctx), target);

  return negated ? !value : value;
};

const parseStyles = (value) => {
  switch (typeOf(value)) {
    case 'String':
      return value.split(';').reduce((o, value) => {
        const [k, v] = value.split(':').map((v) => v.trim());
        if (k) o[k] = v;
        return o;
      }, {});
    case 'Object':
      return value;
    default:
      return {};
  }
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

const toKebab = (string) =>
  string
    .replace(/[\w]([A-Z])/g, function (m) {
      return m[0] + '-' + m[1];
    })
    .toLowerCase();

const convertStyles = (o) =>
  Object.keys(o).reduce((a, k) => {
    a[toKebab(k)] = o[k];
    return a;
  }, {});

const applyAttribute = (node, name, value, previous) => {
  if (negative(value)) return node.removeAttribute(name);
  let v;

  if (name === 'style') {
    v = joinStyles(
      mergeStyles(
        parseStyles(previous),
        parseStyles(node.getAttribute('style')),
        parseStyles(value)
      )
    );
  } else {
    switch (typeOf(value)) {
      case 'Boolean':
        v = '';
        break;
      case 'Array':
        v = value.join(' ');
        break;
      case 'Object':
        v = Object.keys(value)
          .reduce((a, k) => {
            if (value[k]) a.push(k);
            return a;
          }, [])
          .join(' ');
        break;
      default:
        v = value;
        break;
    }
  }
  return node.setAttribute(name, v);
};

const updateNode = (node, binding, newValue, oldValue) =>
  binding.type === ATTRIBUTE
    ? applyAttribute(node, binding.name, newValue, oldValue)
    : (node.textContent = newValue);

const updateBindings = (node, ctx, p) =>
  (node.__bindings__ || []).forEach((binding) =>
    updateBinding(binding, node, ctx, p)
  );

const updateBinding = (binding, node, ctx, p) => {
  if (binding.eventName)
    return binding.path && (binding.realPath = resolve(binding.path, ctx));

  if (binding.type === LIST_ITEM) return (ctx[binding.path] = node.__index__);

  let oldValue = binding.data;

  if (binding.path) {
    const { path, key } = binding;
    const newValue = getValue(path, ctx, p, binding);

    binding.data = newValue;

    if (binding.type === LIST) {
      const delta = compareKeyedLists(binding.uid, oldValue, newValue);
      return delta && updateList(node, binding, delta);
    }

    if (oldValue === newValue) return;

    if (binding.type === INPUT) {
      if (node.hasAttribute('multiple') && node.nodeName === 'SELECT') {
        Array.from(node.querySelectorAll('option')).forEach((option) => {
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
          node.checked = newValue === node.getAttribute('value');
          if (node.checked) {
            node.setAttribute('checked', '');
          } else {
            node.removeAttribute('checked');
          }
          break;
        default:
          node.setAttribute('value', (node.value = newValue || ''));
          break;
      }
      return;
    }

    if (binding.type === ATTRIBUTE_SPREAD) {
      oldValue = oldValue || {};

      for (let k in newValue) {
        let v = newValue[k];
        if (v === oldValue[k]) continue;
        if (negative(v)) {
          node.removeAttribute(k);
        } else {
          node.setAttribute(k, v);
        }
      }

      return;
    }
  }

  const { paths, parts } = binding;

  const newValue =
    parts.length === 1
      ? getValue(parts[0].value, ctx, p, binding)
      : parts.reduce((a, { type, value }) => {
          return (
            a + (type === 'key' ? getValue(value, ctx, p, binding) : value)
          );
        }, '');

  if (newValue === oldValue) return;

  binding.data = newValue;

  updateNode(node, binding, newValue, oldValue);
};

const Updater = () => (rootNode, data) => {
  let ctx = {};
  let p = copy(data);
  walk(rootNode, (node) => updateBindings(node, ctx, p));
};

export default Updater;
