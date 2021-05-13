import { ATTRIBUTE, INPUT, TEXT, LIST, LIST_ITEM } from './constants.js';

import { last, hasMustache, xwalk as walk } from './helpers.js';

let c = 0;

const resolveSquares = (str) => {
  let parts = str.split(/(\[[^\]]+\])/).filter((v) => v);
  return parts.reduce((a, part) => {
    let v = part.charAt(0) === '[' ? '.' + part.replace(/\./g, ':') : part;
    return a + v;
  }, '');
};

const convertIndex = (path, context) => {
  for (let { index, prop } of context) {
    if (path === index) return `#${prop}`;
  }
  return path;
};

export const resolve = (path, context) => {
  path = convertIndex(path, context);

  let isIndex = path.charAt(0) === '#';

  if (isIndex) path = path.slice(1);

  path = resolveSquares(path);

  let i = context.length;
  while (i--) {
    let { valueIdentifier, prop } = context[i];

    path = path
      .split('.')
      .map((v) => {
        let m = v.charAt(0) === '[';

        if (m) v = v.slice(1, -1);

        v = v.trim();

        if (v === valueIdentifier) v = prop + (m ? ':*' : '.*');

        return m ? `[${v}]` : v;
      })
      .join('.');
  }

  return isIndex ? `#${path}` : path;
};

const getParts = (value, context) =>
  value
    .trim()
    .split(/({{[^{}]+}})/)
    .filter((v) => v)
    .map((v) => {
      let match = v.match(/{{([^{}]+)}}/);

      if (match) {
        let m = match[1].trim();
        let negated = m.charAt(0) === '!';

        if (negated) m = m.slice(1);

        let fn = parseEventHandler(m, context);

        return fn
          ? {
              type: 'function',
              negated,
              ...fn,
            }
          : {
              type: 'key',
              value: resolve(m, context),
              negated,
            };
      }

      return {
        type: 'value',
        value: v,
      };
    });

let subscribers;

function parseElementNode(node, context, callback) {
  let attrs = node.attributes;
  let i = attrs.length;
  while (i--) {
    parseAttributeNode(attrs[i], node, context, callback);
  }
}

const parseEventHandler = (value, context) => {
  let m = value.match(/(?:(\w+) => )?([^\(]+)(?:\(([^\)]*)\))/);

  if (!m) return;

  let event = m[1],
    method = m[2],
    args = m[3] && m[3].trim();

  args = args
    ? args
        .split(',')
        .filter((v) => v)
        .map((v) => v.trim())
        .map((k) => resolve(k, context))
    : null;

  return {
    event,
    method,
    args,
  };
};

const parseAttributeNode = ({ name, value }, node, context, callback) => {
  if (name.startsWith('on')) {
    node.removeAttribute(name);
    let eventName = name.split('on')[1];

    subscribers.add(eventName);

    let { event, method, args } = parseEventHandler(value, context);

    callback(node, [
      {
        type: 'call',
        eventName: eventName,
        event,
        method,
        args,
      },
    ]);
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

    callback(node, [
      binding,
      {
        type: 'set',
        eventName: 'input',
        path,
      },
    ]);
  }

  if (hasMustache(value)) {
    node.removeAttribute(name);

    callback(node, [
      {
        name,
        parts: getParts(value, context),
        type: ATTRIBUTE,
        context: context.slice(),
      },
    ]);
  }
};

const parseTextNode = (value, node, context, callback) => {
  if (hasMustache(value))
    callback(node, [
      {
        parts: getParts(value, context),
        type: TEXT,
        context: context.slice(),
      },
    ]);
};

function parseEach(node) {
  let each = node.getAttribute('each');
  let m = each && each.match(/(.+)\s+in\s+(.+)/);
  if (!m) return;
  let [_, left, right] = m;
  let parts = left.match(/\(([^\)]+)\)/);
  let [valueIdentifier, index] = (parts ? parts[1].split(',') : [left]).map(
    (v) => v.trim()
  );

  return {
    prop: right.trim(),
    valueIdentifier,
    index,
    key: node.getAttribute('key') || 'id',
  };
}

let listCount = 0;

export const parse = (element, callback) => {
  subscribers = new Set();
  c = 0;

  let stack = [];

  function dispatch(node, path) {
    switch (node.nodeType) {
      case node.TEXT_NODE: {
        parseTextNode(node.nodeValue, node, stack, callback);
        break;
      }
      case node.ELEMENT_NODE: {
        if (node.nodeName === 'TEMPLATE') {
          let each = parseEach(node);

          if (each) {
            stack.push(each);

            walk(node.content, dispatch);
            let { key, prop } = last(stack);

            let path = resolve(prop, stack);

            callback(node, [
              {
                type: LIST,
                uid: key,
                path,
                listId: listCount,
              },
            ]);

            let listNodeBinding = {
              path,
              type: LIST_ITEM,
              listId: listCount,
            };

            /*
            
            this is why we see some node more than once in the callback...
            
            */

            for (let child of node.content.children) {
              callback(child, [listNodeBinding]);
            }

            stack.pop();
            listCount++;
          }
        } else {
          parseElementNode(node, stack, callback);
        }
      }
    }
  }

  walk(element, dispatch);

  return Array.from(subscribers);
};

export const apply = ({ bindings, map }, element, rootNode) => {
  let i = -1;

  const dispatch = (node) => {
    i++;

    if (i in map) {
      node.$meta = {
        bindings: map[i].map((n) => bindings[n]).reverse(),
        rootNode,
      };
    }

    if (node.nodeName === 'TEMPLATE' && node.hasAttribute('each')) {
      walk(node.content, dispatch);
    }
  };

  walk(element, dispatch);
};
