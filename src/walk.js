import { isWhitespace } from './helpers.js';

function getTemplateBlockInfo(node) {
  let each = node.getAttribute('each');
  if (!each) return;

  let [valueIdentifier, prop] = each.split(/\s+in\s+/);
  let key = node.getAttribute('key') || 'id';

  return {
    valueIdentifier,
    prop,
    key,
  };
}

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
        let info = getTemplateBlockInfo(node);
        if (info) {
          openRepeatedBlock(info);
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
