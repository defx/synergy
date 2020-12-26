import { debounce, typeOf } from './helpers.js';
import Cache from './cache.js';

const proxy = (obj, callback) => {
  let proxyCache = new WeakMap();
  let cache = Cache();
  let changeset = new Map();

  let cb = debounce(() => {
    callback(Array.from(changeset));
    changeset = new Map();
  });

  let scheduleCallback = (path, value) => {
    changeset.set(path, value);
    cb();
  };

  const getPaths = (target, property) => {
    const paths = cache.get(target);
    if (!paths.length) return [property];
    return paths.map((path) =>
      path.split('.').concat(property).join('.')
    );
  };

  const buildProxy = (value, paths) => {
    if (paths) cache.set(value, paths);

    let proxy = proxyCache.get(value);

    if (proxy === undefined) {
      proxy = new Proxy(value, handler);
      proxyCache.set(value, proxy);
    }

    return proxy;
  };

  const handler = {
    get: function (target, property) {
      return ['Object', 'Array'].includes(
        typeOf(target[property])
      )
        ? buildProxy(
            target[property],
            getPaths(target, property)
          )
        : Reflect.get(...arguments);
    },
    set: function (target, property, value) {
      if (value === target[property]) return true;

      getPaths(target, property).forEach((path) =>
        scheduleCallback(path, value)
      );

      return Reflect.set(...arguments);
    },
    deleteProperty: function (target, property) {
      delete target[property];
      getPaths(target, property).forEach((path) =>
        scheduleCallback(path)
      );
      return true;
    },
  };

  let proxy = buildProxy(obj);

  return proxy;
};

export default proxy;
