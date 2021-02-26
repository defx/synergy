import { ATTRIBUTE, INPUT, TEXT, LIST, LIST_ITEM } from './constants.js';

import { getParts, last, resolve, hasMustache, walk } from './helpers.js';

let subscribers;

function parseElementNode(node, context) {
  let attrs = node.attributes;
  let i = attrs.length;
  while (i--) {
    parseAttributeNode(attrs[i], node, context);
  }
  return context;
}

function parseAttributeNode({ name, value }, node, context) {
  if (name.startsWith('on')) {
    node.removeAttribute(name);
    let lastContext = last(context);
    let eventName = name.split('on')[1];

    subscribers.add(eventName);

    node.__bindings__.push({
      eventName: eventName,
      type: 'call',
      method: value,
      path: lastContext && `${lastContext.prop}.*`,
    });

    return;
  }

  if (
    name === 'name' &&
    value &&
    (node.nodeName === 'INPUT' ||
      node.nodeName === 'SELECT' ||
      node.nodeName === 'TEXTAREA')
  ) {
    let path = resolve(value, context);

    subscribers.add('input');

    let binding = {
      type: INPUT,
      path,
    };

    node.__bindings__.push(binding, {
      type: 'set',
      eventName: 'input',
      path,
    });
  }

  if (hasMustache(value)) {
    node.removeAttribute(name);

    node.__bindings__.push({
      name,
      parts: getParts(value, context),
      type: ATTRIBUTE,
      context: context.slice(),
    });
  }
}

function parseTextNode(value, node, context) {
  if (!hasMustache(value)) return;

  node.__bindings__ = [
    {
      childIndex: Array.from(node.parentNode.childNodes).findIndex(
        (v) => v === node
      ),
      parts: getParts(value, context),
      type: TEXT,
      context: context.slice(),
    },
  ];
}

function parseRepeatedBlock(node) {
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

export default (templateFragment, BINDING_ID) => {
  subscribers = new Set();

  let parse = () => {
    let stack = [];

    function dispatch(node) {
      node.bindingId = BINDING_ID;

      switch (node.nodeType) {
        case node.TEXT_NODE: {
          parseTextNode(node.nodeValue, node, stack);
          break;
        }
        case node.ELEMENT_NODE: {
          if (node.nodeName === 'TEMPLATE') {
            if (node.hasAttribute('each')) {
              stack.push(parseRepeatedBlock(node));
              walk(node.content, dispatch);
              let { key, prop } = last(stack);
              let path = resolve(prop, stack);

              let binding = {
                uid: key,
                path,
              };

              let nodes = Array.from(node.content.children);

              node.__bindings__ = [
                {
                  ...binding,
                  type: LIST,
                  nodes,
                  listItems: [],
                },
              ];

              let listNodeBinding = {
                ...binding,
                type: LIST_ITEM,
              };

              nodes.forEach((child) => {
                child.__bindings__.unshift(listNodeBinding);
              });

              stack.pop();
            }
          } else {
            node.__bindings__ = [];
            parseElementNode(node, stack);
          }
        }
      }
    }

    walk(templateFragment, dispatch);

    return {
      templateFragment,
      subscribers: Array.from(subscribers),
    };
  };

  return parse();
};
