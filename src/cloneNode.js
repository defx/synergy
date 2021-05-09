import { copy, walk } from './helpers.js';

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
    if (fa[i].$meta) {
      fb[i].$meta = copy(fa[i].$meta);
      fb[i].$meta.rootNode = fa[i].$meta.rootNode;
    }
  }

  return newNode;
};
