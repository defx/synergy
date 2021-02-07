import { walk } from './helpers.js';

function flatten(node: Node): Node[] {
  const res: Node[] = [];
  walk(node, (x: Node) => res.push(x));
  return res;
}

const cloneNodeWithBindings = (node: Node) => {
  let newNode = node.cloneNode(true);
  let fa = flatten(node);
  let fb = flatten(newNode);

  let i = fa.length;
  while (i--) {
    fb[i].bindingId = fa[i].bindingId;
    if (fa[i].__bindings__) {
      fb[i].__bindings__ = fa[i].__bindings__.map((v) => ({
        ...v,
      }));
    }
  }

  return newNode;
};

export default cloneNodeWithBindings;
