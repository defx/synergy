import { debounce, typeOf } from './helpers.js';

const NOOP = () => {};

/*

@TODO: callbackObserved with TP prop & value

*/

function observe(
  root = {},
  callbackAny,
  callbackObserved = NOOP,
  observedProperties = []
) {
  let proxyCache = new WeakMap();

  function scheduleCallback(cb) {
    requestAnimationFrame(cb);
  }

  function proxy(target, handler) {
    let proxy = proxyCache.get(target);
    if (proxy === undefined) {
      proxy = new Proxy(target, handler);
      proxyCache.set(target, proxy);
    }
    return proxy;
  }

  const handler1 = {
    get(target, property) {
      if (
        ['Object', 'Array'].includes(
          typeOf(target[property])
        )
      ) {
        let handler =
          target === root &&
          observedProperties.includes(property)
            ? handler2
            : handler1;

        return proxy(target[property], handler);
      } else {
        return Reflect.get(...arguments);
      }
    },
    set(target, property, value) {
      scheduleCallback(callbackAny);
      if (
        target === root &&
        observedProperties.includes(property)
      ) {
        scheduleCallback(callbackObserved);
      }
      return Reflect.set(...arguments);
    },
  };

  const handler2 = {
    get(target, property) {
      if (
        ['Object', 'Array'].includes(
          typeOf(target[property])
        )
      ) {
        return proxy(target[property], handler2);
      } else {
        return Reflect.get(...arguments);
      }
    },
    set(target, property, value) {
      scheduleCallback(callbackAny);
      scheduleCallback(callbackObserved);
      return Reflect.set(...arguments);
    },
  };

  return new Proxy(root, handler1);
}

export default observe;
