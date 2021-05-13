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
  getBinding,
  isWhitespace,
} from './helpers.js';
import { cloneNode } from './cloneNode.js';
import { compareKeyedLists } from './compareKeyedLists.js';
import { apply } from './xbindings.js';

const getListItems = (template) => {
  let node = template.nextSibling;
  let nodes = [];
  let listId = getBinding(template, LIST).listId;

  while (node && getBinding(node, LIST_ITEM)?.listId === listId) {
    let blockIndex = getBinding(node, LIST_ITEM).blockIndex;
    nodes[blockIndex] = nodes[blockIndex] || [];
    nodes[blockIndex].push(node);
    node = node.nextSibling;
  }

  return nodes;
};

/*

@todo: 
  - replace nodes array with fragments

*/

const clone = (template, binding) => {
  let fragment = template.content.cloneNode(true);
  apply(binding.map, fragment, template.$meta.rootNode);
  let nodes = [];
  for (let node of fragment.childNodes) {
    if (!isWhitespace(node)) {
      nodes.push(node);
    }
  }
  return nodes;
};

const updateList = (template, delta, binding) => {
  let listItems = getListItems(template);
  let fragment = document.createDocumentFragment();

  listItems.forEach(removeNodes);

  delta.forEach((i, newIndex) => {
    let nodes = i === -1 ? clone(template, binding) : listItems[i];
    nodes.forEach((el) => {
      getBinding(el, LIST_ITEM).blockIndex = newIndex;
      fragment.appendChild(el);
    });
  });
  template.after(fragment);
};

let getPreviousValue = (node, binding) =>
  binding.type === ATTRIBUTE
    ? attributeToProp(binding.name, node.getAttribute(binding.name)).value
    : node.textContent;

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

const convertStyles = (o) =>
  Object.keys(o).reduce((a, k) => {
    a[pascalToKebab(k)] = o[k];
    return a;
  }, {});

const applyComplexAttribute = (node, name, value) => {
  if (name === 'style') {
    value = joinStyles(
      convertStyles({
        ...parseStyles(node.getAttribute('style')),
        ...parseStyles(value),
      })
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
    ? applyComplexAttribute(node, binding.name, newValue)
    : (node.textContent = newValue);

const updateBinding = (binding, node, ctx, p, viewmodel) => {
  if (binding.eventName) {
    binding.ctx = copy(ctx);
    binding.path && (binding.realPath = resolve(binding.path, ctx)); // @delete
    return;
  }

  if (binding.type === LIST_ITEM) {
    console.log(node, binding.path, binding.blockIndex);
    return (ctx[binding.path] = binding.blockIndex);
  }

  let oldValue = getPreviousValue(node, binding);

  if (binding.path) {
    const { path } = binding;
    const newValue = getValue({ value: path }, ctx, p);

    if (binding.type === LIST) {
      const delta = compareKeyedLists(
        binding.uid,
        node.$meta.blockData,
        newValue
      );
      // console.log(node, delta, binding, newValue);
      node.$meta.blockData = newValue;
      return delta && updateList(node, delta, binding);
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

export const updater =
  (mountNode, viewmodel, updatedCallback = () => {}) =>
  (rootNode) => {
    let ctx = {};
    let p = copy(viewmodel);

    walk(rootNode, (node) => {
      if (node.$meta?.rootNode !== mountNode) return;

      let bindings = node.$meta.bindings;

      if (bindings) {
        bindings.forEach((binding) =>
          updateBinding(binding, node, ctx, p, viewmodel)
        );
      }
    });

    if (prev) updatedCallback(prev);

    prev = p;
  };
