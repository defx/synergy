import { getValueAtPath, setValueAtPath } from './helpers.js';

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

const subscribe = (rootNode, subscribers, proxy) => {
  subscribers.forEach((type) => {
    rootNode.addEventListener(
      type,
      (e) => {
        let bindings = (e.target.__bindings__ || []).filter(
          ({ eventName }) => eventName === type
        );
        if (!bindings.length) return;

        bindings.forEach((binding) => {
          if (binding.type === 'call') {
            let fn = proxy[binding.method](
              e,
              binding.realPath && getValueAtPath(binding.realPath, proxy)
            );
            if (fn) {
              requestAnimationFrame(fn);
            }
          }
          if (binding.type === 'set') {
            setValueAtPath(binding.realPath, inputValue(e.target), proxy);
          }
        });
      },
      type === 'blur' || type === 'focus'
    );
  });
};

export default subscribe;
