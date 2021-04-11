import { LIST, LIST_ITEM, ATTRIBUTE, INPUT, TEXT } from './constants.js';
import {
  getValueAtPath,
  callFunctionAtPath,
  walk,
  typeOf,
  copy,
  removeNodes,
  pascalToKebab,
  applyAttribute,
  attributeToProp,
  isPrimitive,
  kebabToPascal,
  resolve,
} from './helpers.js';
import { cloneNode } from './cloneNode.js';
import { compareKeyedLists } from './compareKeyedLists.js';

const getListItems = (template) => {
  let node = template.nextSibling;

  let nodes = [];

  while (node && node.listId === template.listId) {
    nodes[node.__index__] = nodes[node.__index__] || [];
    nodes[node.__index__].push(node);
    node = node.nextSibling;
  }

  return nodes;
};

const updateList = (template, delta) => {
  let itemNodes = Array.from(template.content.children);
  let listItems = getListItems(template);
  let fragment = document.createDocumentFragment();

  listItems.forEach(removeNodes);

  delta.forEach((i, newIndex) => {
    let nodes = i === -1 ? itemNodes.map(cloneNode) : listItems[i];

    nodes.forEach((el) => {
      el.__index__ = newIndex;
      fragment.appendChild(el);
    });

    return nodes;
  });
  template.after(fragment);
};

let getPreviousValue = (node, binding) => {
  switch (binding.type) {
    case ATTRIBUTE:
      return attributeToProp(binding.name, node.getAttribute(binding.name)).value;
    case TEXT:
      return node.textContent;
    default:
      return binding.data;
  }
};

const getValue = (part, ctx, target) => {
  let { value, negated } = part;

  if (value.charAt(0) === '#') {
    return ctx[value.slice(1)];
  }

  let v = getValueAtPath(resolve(value, ctx, target), target);

  return negated ? !v : v;
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

const applyComplexAttribute = (node, name, value, previous) => {
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
    ? applyComplexAttribute(node, binding.name, newValue, binding.data)
    : (node.textContent = newValue);

const updateBinding = (binding, node, ctx, p, viewmodel) => {
  if (binding.eventName) {
    binding.ctx = copy(ctx);
    binding.path && (binding.realPath = resolve(binding.path, ctx)); // @delete
    return;
  }

  if (binding.type === LIST_ITEM) return (ctx[binding.path] = node.__index__);

  let oldValue = getPreviousValue(node, binding);

  if (binding.path) {
    const { path } = binding;
    const newValue = getValue({ value: path }, ctx, p);

    binding.data = newValue;

    if (binding.type === LIST) {
      const delta = compareKeyedLists(binding.uid, oldValue, newValue);
      return delta && updateList(node, delta);
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
  }

  const newValue = binding.parts.reduce((a, part) => {
    let { type, value } = part;

    let v = value;

    if (type === 'key') {
      v = getValue(part, ctx, p);
    } else if (type === 'function') {
      let args = part.args.map((value) => getValue({ value }, ctx, p));
      v = callFunctionAtPath(part.method, viewmodel, args);
    }

    return a ? a + v : v;
  }, '');

  if (newValue === oldValue) return;

  updateNode(node, binding, newValue);
};

let prev;

export const updater = (BINDING_ID, updatedCallback = () => {}) => (rootNode, viewmodel) => {
  let ctx = {};
  let p = copy(viewmodel);

  walk(rootNode, (node) => {
    if (node.bindingId !== BINDING_ID) return;

    let bindings = node.__bindings__;

    if (bindings) {
      bindings.forEach((binding) => updateBinding(binding, node, ctx, p, viewmodel));
    }
  });

  if (prev) updatedCallback(prev);

  prev = p;
};
