import {
  getValueAtPath,
  setValueAtPath,
} from './helpers.js';

const inputValue = (
  node: EventTarget
): string | string[] => {
  if ('selectedOptions' in node) {
    /* @todo: avoid the assertion?  */
    return Array.from(node.selectedOptions).map(
      (node) => (node as HTMLOptionElement).value
    );
  }

  switch (node.getAttribute('type')) {
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
): (SetBinding | CallBinding)[] => {
  if (
    !node ||
    node.bindingId !== BINDING_ID ||
    !node.__bindings__
  )
    return [];

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
        getEventBindings(
          BINDING_ID,
          type,
          e.target
        ).forEach((binding) => {
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
              binding.realPath!,
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
