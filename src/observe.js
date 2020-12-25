import { typeOf } from './helpers.js';

const NOOP = () => {};

function observe(root = {}, options = {}) {
  let {
    changeCallback = NOOP,
    observedProperties = [],
    propertyChangedCallback = NOOP,
  } = options;

  let pathMap = new WeakMap();
  let observed = new Map();
  let proxyCache = new WeakMap();

  function scheduleCallback() {
    requestAnimationFrame(() => {
      changeCallback();
      Array.from(observed).forEach(([k, v]) =>
        propertyChangedCallback(k, v)
      );
      observed = new Map();
    });
  }

  function proxee(target, property) {
    let path = (pathMap.get(target) || []).concat(
      property
    );
    let proxy = proxyCache.get(target[property]);
    if (proxy === undefined) {
      proxy = new Proxy(
        target[property],
        handler
      );
      proxyCache.set(target[property], proxy);
    }

    pathMap.set(target[property], path);
    return proxy;
  }

  const handler = {
    get(target, property) {
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
      let path = (
        pathMap.get(target) || []
      ).concat(property);

      if (observedProperties.includes(path[0])) {
        observed.set(path, value);
      }
      scheduleCallback();

      return Reflect.set(...arguments);
    },
  };
  return new Proxy(root, handler);
}

export default observe;
