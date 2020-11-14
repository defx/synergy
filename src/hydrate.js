import { walk } from './helpers.js';

const transferBindings = (BINDING_ID, templateFragment, targetNode) => {
  let bindings = {};

  walk(templateFragment, (node, path) => {
    if (node.nodeName === 'SLOT') {
      return false; //skip this node and its children
    }
    if (node.__bindings__ && node.__bindings__.length) {
      bindings[path] = node;
    }
  });

  let shouldHydrate;

  walk(targetNode, (node, path) => {
    if (shouldHydrate === false) return false;
    if (path in bindings) {
      let newNode = bindings[path];

      shouldHydrate = newNode.isEqualNode(node);

      node.__bindings__ = newNode.__bindings__;
      node.bindingId = BINDING_ID;

      if (node.value !== undefined) {
        if (node.nodeName === 'TEXTAREA') {
          node.value = node.textContent;
        } else {
          node.value = node.getAttribute('value');
        }
      }
    }
  });

  return shouldHydrate;
};

export default transferBindings;
