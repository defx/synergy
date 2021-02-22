import { typeOf } from './helpers.js';

function proxyFactory(root: object, callbackAny: Function) {
  let proxyCache = new WeakMap();

  function proxy(target: object, handler: object) {
    let proxy = proxyCache.get(target);
    if (proxy === undefined) {
      proxy = new Proxy(target, handler);
      proxyCache.set(target, proxy);
    }
    return proxy;
  }

  const handler = {
    get(
      target: { [key: string]: any },
      property: string | number,
      receiver?: any
    ): boolean {
      if (
        ['Object', 'Array'].includes(
          typeOf(target[property])
        )
      ) {
        return proxy(target[property], handler);
      } else {
        return Reflect.get(target, property, receiver);
      }
    },
    set(
      target: { [key: string]: any },
      property: string | number,
      value: any,
      receiver?: any
    ) {
      if (value === target[property]) return true;

      callbackAny();
      return Reflect.set(target, property, value, receiver);
    },
    deleteProperty(target: object, property: string) {
      callbackAny();
      return Reflect.deleteProperty(target, property);
    },
  };

  return new Proxy(root, handler);
}

export default proxyFactory;
