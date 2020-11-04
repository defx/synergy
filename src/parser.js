import {
  ATTRIBUTE,
  ATTRIBUTE_SPREAD,
  BIND,
  INPUT,
  REPEAT,
  SUBSCRIBE,
  TEXT,
  ELEMENT_NODE,
  TEXT_NODE,
  EACH,
  LIST,
} from './constants.js';

import {
  getParts,
  last,
  resolve,
  hasMustache,
  parseEachDeclaration,
} from './helpers.js';

import walk from './walk.js';

const fromTemplate = (template) => {
  let doc = new DOMParser().parseFromString(
    `<span>${template}</span>`,
    'text/html'
  );
  return doc.body.firstChild;
};

export default (rootNode) => {
  let subscribers = new Set();

  let parse = (v) => {
    let rootNode = fromTemplate(v);

    walk(rootNode, (node, context) => {
      node.__bindings__ = node.__bindings__ || [];

      switch (node.nodeType) {
        case ELEMENT_NODE:
          return parseElementNode(node, context);
        case TEXT_NODE:
          return parseTextNode(node.nodeValue, node, context);
      }
    });

    return {
      rootNode,
      subscribers: Array.from(subscribers),
    };
  };

  let parseTextNode = (value, node, context) => {
    if (!hasMustache(value)) return;

    node.__bindings__.push({
      childIndex: Array.from(node.parentNode.childNodes).findIndex(
        (v) => v === node
      ),
      parts: getParts(value, context),
      type: TEXT,
      context: context.slice(),
    });
  };

  let parseElementNode = (node, context) => {
    if (!node.hasAttributes()) return;
    let value = node.getAttribute(EACH);
    if (value) {
      parseAttributeNode({ name: EACH, value }, node, context);
    }
    let attrs = node.attributes;
    let i = attrs.length;
    while (i--) {
      if (attrs[i].name !== EACH) parseAttributeNode(attrs[i], node, context);
    }
    return context;
  };

  let parseAttributeNode = ({ name, value }, node, context) => {
    if (name.charAt(0) === '{') {
      let res = name.match(/{{\.{3}([^{}]+)}}/);
      let match = res && res[1];
      if (match) {
        node.removeAttribute(name);
        node.__bindings__.push({
          name,
          path: resolve(match, context),
          type: ATTRIBUTE_SPREAD,
        });
      }
    }

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
      (node.nodeName === 'INPUT' ||
        node.nodeName === 'SELECT' ||
        node.nodeName === 'TEXTAREA')
    ) {
      let path = resolve(value, context);

      subscribers.add('input');

      let binding = {
        parts: [
          {
            type: 'key',
            value: path,
          },
        ],
        type: INPUT,
        context: context.slice(),
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

    if (name === EACH) {
      let { key, prop } = last(context);

      node.removeAttribute(name);

      let path = resolve(prop, context);

      let binding = {
        parts: [
          {
            type: 'key',
            value: path,
          },
        ],
        type: LIST,
        key,
        path,
        node,
        nodes: [],
        uid: node.getAttribute('key') || undefined,
      };

      node.__bindings__.push(binding);

      node.removeAttribute('key');

      return;
    }
  };

  return parse(rootNode);
};
