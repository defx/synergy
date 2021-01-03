import { typeOf } from './helpers.js';

/*

@TODO: callbackObserved with TP prop & value

*/

function observe(
  root = {},
  callbackAny,
  observedProperties = [],
  callbackObserved
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
      if (['Object', 'Array'].includes(typeOf(target[property]))) {
        let handler =
          target === root && observedProperties.includes(property)
            ? handler2
            : handler1;

        return proxy(target[property], handler);
      } else {
        return Reflect.get(...arguments);
      }
    },
    set(target, property, value) {
      if (value === target[property]) return true;
      scheduleCallback(callbackAny);
      if (target === root && observedProperties.includes(property)) {
        scheduleCallback(() => callbackObserved(property, value));
      }
      return Reflect.set(...arguments);
    },
    deleteProperty(target, property) {
      scheduleCallback(callbackAny);
      return Reflect.deleteProperty(...arguments);
    },
  };

  const handler2 = {
    get(target, property) {
      if (['Object', 'Array'].includes(typeOf(target[property]))) {
        return proxy(target[property], handler2);
      } else {
        return Reflect.get(...arguments);
      }
    },
    set(target, property, value) {
      if (value === target[property]) return true;
      scheduleCallback(callbackAny);
      scheduleCallback(() => callbackObserved(property, value));
      return Reflect.set(...arguments);
    },
    deleteProperty(target, property) {
      scheduleCallback(callbackAny);
      return Reflect.deleteProperty(...arguments);
    },
  };

  return new Proxy(root, handler1);
}

export default observe;
