import { EACH, TEXT_NODE, LIST, LIST_ITEM } from './constants.js';
import { parseEachDeclaration } from './helpers.js';

const isWhitespace = (node) =>
  node.nodeType === TEXT_NODE && node.nodeValue.match(/^\s+$/);

function walk(node, callback, context = []) {
  let newScope = node.nodeType === 1 && node.getAttribute(EACH);
  let listNode = newScope && node;

  if (newScope) {
    context.push(parseEachDeclaration(newScope, context));
  }

  callback(node, context);

  node = node.firstChild;

  while (node) {
    if (!isWhitespace(node)) walk(node, callback, context);
    node = node.nextSibling;
  }

  if (listNode) {
    context.pop();

    let comment = document.createComment(` @each ${newScope} `);

    comment.__bindings__ = listNode.__bindings__.filter(
      ({ type }) => type === LIST
    );

    listNode.parentNode.replaceChild(comment, listNode);
  }
}

export default walk;
