import { walk } from './helpers.js';

const transferBindings = (BINDING_ID, sourceNode, targetNode) => {
  let nodes = [];

  walk(sourceNode, (node, path) => {
    if (node.nodeName === 'SLOT') return false;
    if (node !== sourceNode) nodes.push(node);
  });

  if (nodes.length === 0) return false;

  let nextNode = nodes.shift();

  walk(targetNode, (node, path) => {
    if (!nextNode) return false;
    if (node.nodeName === nextNode.nodeName) {
      node.__bindings__ = nextNode.__bindings__;
      node.__index__ = nextNode.__index__;
      node.bindingId = BINDING_ID;
      nextNode = nodes.shift();
    }
  });

  return !nextNode;
};

export default transferBindings;
