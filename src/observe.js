import { ROOT_PROXY } from './constants.js';
import { typeOf } from './helpers.js';

const NOOP = () => {};

function observe(root = {}, callback) {
  let proxyCache = new WeakMap();

  function scheduleCallback() {
    requestAnimationFrame(callback);
  }

  function proxee(target, property) {
    let proxy = proxyCache.get(target[property]);
    if (proxy === undefined) {
      proxy = new Proxy(
        target[property],
        handler
      );
      proxyCache.set(target[property], proxy);
    }
    return proxy;
  }

  const handler = {
    get(target, property) {
      if (property === ROOT_PROXY) {
        // return proxyCache.get(target);
        console.log(
          'ROOT:',
          proxyCache.get(target)
        );
        return proxyCache.get(target);
      }

      if (
        ['Object', 'Array'].includes(
          typeOf(target[property])
        )
      ) {
        return proxee(target, property);
      } else {
        return Reflect.get(...arguments);
      }
    },
    set(target, property, value) {
      scheduleCallback();

      return Reflect.set(...arguments);
    },
  };
  return new Proxy(root, handler);
}

export default observe;
