import { walk } from './helpers.js';

const transferBindings = (BINDING_ID, sourceNode, targetNode) => {
  let nodesByPath = {};

  walk(sourceNode, (node, path) => {
    if (node.nodeName === 'SLOT') return false; //dont compare this node or its children
    if (node !== sourceNode) nodesByPath[path] = node;
  });

  let shouldHydrate;

  walk(targetNode, (node, path) => {
    if (shouldHydrate === false) return false;
    if (path in nodesByPath) {
      let newNode = nodesByPath[path];

      shouldHydrate = newNode.nodeName === node.nodeName;

      if (!shouldHydrate) return;

      if (newNode.__bindings__) {
        node.__bindings__ = newNode.__bindings__;
        node.bindingId = BINDING_ID;
      }

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
