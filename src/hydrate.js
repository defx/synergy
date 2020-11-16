import { walk } from './helpers.js';

const sameNode = (a, b) => {
  if (a.nodeName !== b.nodeName) return false;

  if (a.nodeType === a.TEXT_NODE) {
    /* If a text node is slotted into another text node, they will have been joined together when pre-rendered to string  */
    return b.textContent.includes(a.textContent);
  }

  return (
    Array.from(a.attributes).toString() === Array.from(b.attributes).toString()
  );
};

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

      shouldHydrate = sameNode(newNode, node);

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
