import {
  getValueAtPath,
  setValueAtPath,
} from './helpers.js';

const inputValue = (
  node: EventTarget
): string | string[] => {
  if (
    node.hasAttribute('multiple') &&
    node.nodeName === 'SELECT'
  ) {
    /* @todo: avoid the assertion?  */
    return Array.from(node.selectedOptions).map(
      (node) => (node as HTMLSelectElement).value
    );
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

const getEventBindings = (
  BINDING_ID: number,
  type: string,
  node: EventTarget | null
): (SetBinding | CallBinding)[] | undefined => {
  if (
    !node ||
    node.bindingId !== BINDING_ID ||
    !node.__bindings__
  )
    return;

  let bindings = node.__bindings__.filter(
    (binding): binding is SetBinding | CallBinding =>
      'eventName' in binding && binding.eventName === type
  );

  return bindings.length
    ? bindings
    : getEventBindings(BINDING_ID, type, node.parentNode);
};

const subscribe = (
  eventDelegate: Node,
  subscribers: string[], //@todo: be more specific :)
  proxy: { [key: string]: any },
  BINDING_ID: number
) => {
  subscribers.forEach((type) => {
    eventDelegate.addEventListener(
      type,
      (e) => {
        let bindings = getEventBindings(
          BINDING_ID,
          type,
          e.target
        );

        if (!bindings) return;

        bindings.forEach((binding) => {
          if (binding.type === Binding.CALL) {
            let v =
              binding.realPath &&
              getValueAtPath(binding.realPath, proxy);

            let fn = proxy[binding.method](e, v);
            if (fn) {
              requestAnimationFrame(fn);
            }
          } else {
            setValueAtPath(
              binding.realPath,
              inputValue(e.target!),
              proxy
            );
          }
        });
      },
      type === 'blur' || type === 'focus'
    );
  });
};

export default subscribe;
