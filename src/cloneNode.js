import { walk } from './helpers.js';

const flatten = (node) => {
  const res = [];
  walk(node, (x) => {
    res.push(x);
    if (x.nodeName === 'TEMPLATE') {
      res.push(...flatten(x.content));
    }
  });
  return res;
};

export const cloneNode = (node) => {
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

  newNode.listId = node.listId;

  return newNode;
};
