import { walk } from './helpers.js';

function flatten(node) {
  const res = [];
  walk(node, (x) => res.push(x));
  return res;
}

const cloneNodeWithBindings = (node) => {
  let newNode = node.cloneNode(true);
  let fa = flatten(node);
  let fb = flatten(newNode);

  let i = fa.length;
  while (i--) {
    fb[i].bindingId = fa[i].bindingId;
    if (fa[i].__bindings__) {
      fb[i].__bindings__ = fa[i].__bindings__.map((v) => ({ ...v }));
    }
  }

  return newNode;
};

export default cloneNodeWithBindings;
