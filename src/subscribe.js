import { getValueAtPath, setValueAtPath, resolve } from './helpers.js';

const inputValue = (node) => {
  if (node.hasAttribute('multiple') && node.nodeName === 'SELECT') {
    return Array.from(node.selectedOptions).map((node) => node.value);
  }
  let type = node.getAttribute('type') || 'text';

  switch (type) {
    case 'checkbox':
      return node.checked;
    case 'radio':
      return node.getAttribute('value');
    default:
      return node.value;
  }
};

const getEventBinding = (rootNode, type, node) => {
  if (!node) return;

  let binding =
    node.$meta?.rootNode === rootNode &&
    node.$meta.bindings.find(({ eventName }) => eventName === type);

  return binding || getEventBinding(rootNode, type, node.parentNode);
};

export const subscribe = (rootNode, subscribers, proxy) => {
  subscribers.forEach((type) => {
    rootNode.addEventListener(
      type,
      (e) => {
        let binding = getEventBinding(rootNode, type, e.target);

        if (!binding) return;

        if (binding.type === 'call') {
          let args = binding.args
            ? binding.args
                .map((v) => resolve(v, binding.ctx, proxy))
                .map((v) => (v === binding.event ? e : getValueAtPath(v, proxy)))
            : [];

          let fn = proxy[binding.method](...args);

          if (fn) {
            requestAnimationFrame(fn);
          }
        }

        if (binding.type === 'set') {
          setValueAtPath(binding.realPath, inputValue(e.target), proxy);
        }
      },
      type === 'blur' || type === 'focus'
    );
  });
};
