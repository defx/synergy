import { walk } from './helpers.js';

export const hydrate = (BINDING_ID, sourceNode, targetNode) => {
  let nodes = [];

  walk(sourceNode, (node) => {
    if (node.nodeName === 'SLOT') return false;
    if (node !== sourceNode && node.__bindings__) nodes.push(node);
  });

  let nextNode = nodes.shift();

  walk(targetNode, (node) => {
    if (!nextNode) return false;
    if (node.nodeName === nextNode.nodeName) {
      node.__bindings__ = nextNode.__bindings__;
      node.__index__ = nextNode.__index__;
      node.bindingId = BINDING_ID;
      nextNode = nodes.shift();
    }
  });
};
