import { walk } from './helpers.js';

const transferBindings = (fromNode, toNode) => {
  let bindings = {};

  walk(fromNode, (node, path) => {
    if (node.__bindings__ && node.__bindings__.length) {
      bindings[path] = node.__bindings__;
    }
  });

  walk(toNode, (node, path) => {
    if (path in bindings) {
      node.__bindings__ = bindings[path];

      if (node.value !== undefined) {
        if (node.nodeName === 'TEXTAREA') {
          node.value = node.textContent;
        } else {
          node.value = node.getAttribute('value');
        }
      }
    }
  });
};

export default transferBindings;
