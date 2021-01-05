import { typeOf } from './helpers.js';

function observe(root, callbackAny) {
  let proxyCache = new WeakMap();

  function proxy(target, handler) {
    let proxy = proxyCache.get(target);
    if (proxy === undefined) {
      proxy = new Proxy(target, handler);
      proxyCache.set(target, proxy);
    }
    return proxy;
  }

  const handler = {
    get(target, property) {
      if (
        ['Object', 'Array'].includes(
          typeOf(target[property])
        )
      ) {
        return proxy(target[property], handler);
      } else {
        return Reflect.get(...arguments);
      }
    },
    set(target, property, value) {
      if (value === target[property]) return true;

      callbackAny();
      return Reflect.set(...arguments);
    },
    deleteProperty(target, property) {
      callbackAny();
      return Reflect.deleteProperty(...arguments);
    },
  };

  return new Proxy(root, handler);
}

export default observe;
