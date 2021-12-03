import { typeOf } from "./helpers.js";

export const proxy = (root, callback) => {
  let proxyCache = new WeakMap();

  function createProxy(target, handler) {
    let proxy = proxyCache.get(target);
    if (proxy === undefined) {
      proxy = new Proxy(target, handler);
      proxyCache.set(target, proxy);
    }
    return proxy;
  }

  const handler = {
    get(target, property) {
      if (["Object", "Array"].includes(typeOf(target[property]))) {
        return createProxy(target[property], handler);
      } else {
        return Reflect.get(...arguments);
      }
    },
    set(target, property, value) {
      if (value === target[property]) return true;

      callback();
      return Reflect.set(...arguments);
    },
    deleteProperty() {
      callback();
      return Reflect.deleteProperty(...arguments);
    },
  };

  return new Proxy(root, handler);
};
