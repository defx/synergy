import { isWhitespace } from './helpers.js';

function walk(node, callback) {
  let {
    elementNode,
    textNode,
    each,
    openRepeatedBlock,
    closeRepeatedBlock,
  } = callback;

  each(node);

  switch (node.nodeType) {
    case node.TEXT_NODE: {
      textNode(node);
      break;
    }
    case node.ELEMENT_NODE: {
      if (node.nodeName === 'TEMPLATE') {
        if (node.hasAttribute('each')) {
          openRepeatedBlock(node);
          walk(node.content, callback);
          closeRepeatedBlock(node);
        }
      } else {
        elementNode(node);
      }
    }
  }

  node = node.firstChild;

  while (node) {
    if (!isWhitespace(node)) walk(node, callback);
    node = node.nextSibling;
  }
}

export default walk;
