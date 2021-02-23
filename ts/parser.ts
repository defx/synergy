import {
  getParts,
  last,
  resolve,
  hasMustache,
  walk,
} from './helpers';

let subscribers = new Set<string>();

function parseElementNode(
  node: Node,
  context: RepeatedBlock[]
) {
  let attrs = node.attributes;
  let i = attrs.length;
  while (i--) {
    parseAttributeNode(attrs[i], node, context);
  }
  return context;
}

function parseAttributeNode(
  { name, value }: Attr,
  node: Node,
  context: RepeatedBlock[]
) {
  if (name.startsWith('on')) {
    node.removeAttribute(name);
    let lastContext = last(context);
    let eventName = name.split('on')[1];

    subscribers.add(eventName);

    node.__bindings__.push({
      eventName: eventName,
      type: Binding.CALL,
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

    node.__bindings__.push(
      {
        parts: [
          {
            type: 'key',
            value: path,
          },
        ],
        type: Binding.INPUT,
        path,
      },
      {
        type: Binding.SET,
        eventName: 'input',
        path,
      }
    );
  }

  if (hasMustache(value)) {
    node.removeAttribute(name);

    node.__bindings__.push({
      name,
      parts: getParts(value, context),
      type: Binding.ATTRIBUTE,
      context: context.slice(),
    });
  }
}

function nodeIndex(node: Node) {
  return node.parentNode
    ? Array.from(node.parentNode.childNodes).findIndex(
        (v) => v === node
      )
    : -1;
}

function parseTextNode(
  value: string,
  node: Node,
  context: RepeatedBlock[]
) {
  if (!hasMustache(value)) return;

  node.__bindings__ = [
    {
      childIndex: nodeIndex(node),
      parts: getParts(value, context),
      type: Binding.TEXT,
      context: context.slice(),
    },
  ];
}

function parseRepeatedBlock(
  node: Node
): RepeatedBlock | undefined {
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

export default (
  fragment: DocumentFragment,
  BINDING_ID: number
) => {
  subscribers = new Set();

  let parse = () => {
    let stack: RepeatedBlock[] = [];

    function dispatch(node: Node) {
      node.bindingId = BINDING_ID;

      switch (node.nodeType) {
        case node.TEXT_NODE: {
          parseTextNode(node.nodeValue!, node, stack);
          break;
        }
        case node.ELEMENT_NODE: {
          if (node.nodeName === 'TEMPLATE') {
            let each = parseRepeatedBlock(node);

            if (each) {
              stack.push(each);
              walk(node.content, dispatch);
              let { key, prop } = each;
              let path = resolve(prop, stack);

              let binding = {
                uid: key,
                path,
              };

              let nodes = Array.from(
                (node as HTMLTemplateElement).content
                  .children
              );

              node.__bindings__ = [
                {
                  ...binding,
                  type: Binding.LIST,
                  nodes,
                  listItems: [],
                },
              ];

              nodes.forEach((child) => {
                child.__bindings__.unshift({
                  ...binding,
                  type: Binding.LIST_ITEM,
                });
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

    walk(fragment, dispatch);

    return {
      fragment,
      subscribers: Array.from(subscribers),
    };
  };

  return parse();
};
