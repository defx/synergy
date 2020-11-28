import { LIST, LIST_ITEM } from './constants.js';

import { isWhitespace } from './helpers.js';

const middleSiblings = (from, to, siblings = []) => {
  let next = from.nextSibling;
  return next === to
    ? siblings.filter((node) => !isWhitespace(node))
    : middleSiblings(next, to, siblings.concat(next));
};

const getBlockInfo = (node) => {
  let content = node.nodeValue;

  let x = content.match(/(#|\/)each/);

  if (!x) return;

  let res = {
    op: x[1],
  };

  if (x[1] === '#') {
    let [_, expr, args] = content.match(
      /^\s*#each\s*([\w\[,\]\s]+\s+in\s+[\w.]+)?\s*(?:\((.+)\))?/
    );

    res.expr = expr;
    res.args = args;
  }

  return res;
};

const stack = [];

function walk(node, callback) {
  let { openBlock, elementNode, textNode, closeBlock, each } = callback;

  each(node);

  switch (node.nodeType) {
    case node.COMMENT_NODE: {
      let info = getBlockInfo(node);
      if (info) {
        let { op, expr, args } = info;
        if (op === '#') {
          openBlock(expr, args);
          stack.push(node);
        }
        if (op === '/') {
          let openingNode = stack.pop();
          closeBlock(openingNode, middleSiblings(openingNode, node), node);
        }
      }
      break;
    }
    case node.TEXT_NODE: {
      textNode(node);
      break;
    }
    case node.ELEMENT_NODE: {
      elementNode(node);
    }
  }

  node = node.firstChild;

  while (node) {
    if (!isWhitespace(node)) walk(node, callback);
    node = node.nextSibling;
  }
}

export default walk;
