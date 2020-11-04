import PathMap from './pathMap.js';
import { debounce } from './helpers.js';

const proxy = (obj, callback) => {
  const TARGET = Symbol('target');
  const proxyCache = new WeakMap();
  let pathMap = PathMap();
  let changeset = new Map();

  let cb = debounce(() => {
    callback(Array.from(changeset));
    changeset = new Map();
  });

  let scheduleCallback = (path, value) => {
    changeset.set(path, value);
    cb();
  };

  const getPaths = (value, property) => {
    const paths = pathMap.get(value);
    if (!paths || !paths.length) return [property];
    return property
      ? paths.map((path) => path.split('.').concat(property).join('.'))
      : paths;
  };

  const buildProxy = (value, paths) => {
    value = value[TARGET] || value;

    if (paths) pathMap.appendAll(value, paths);

    let proxy = proxyCache.get(value);

    if (proxy === undefined) {
      proxy = new Proxy(value, handler);
      proxyCache.set(value, proxy);
    }

    return proxy;
  };

  const handler = {
    get: function (target, property) {
      if (property === TARGET) return target;

      if (
        ['[object Object]', '[object Array]'].indexOf(
          Object.prototype.toString.call(target[property])
        ) > -1
      ) {
        return buildProxy(target[property], getPaths(target, property));
      }

      return Reflect.get(...arguments);
    },
    set: function (target, property, value) {
      if (value === target[property]) return true;

      let descriptor = Object.getOwnPropertyDescriptor(target, property);

      if (descriptor && descriptor.set) {
        descriptor.set.call(proxyCache.get(target), value);
      } else {
        target[property] = value;
      }
      getPaths(target, property).forEach((path) =>
        scheduleCallback(path, value)
      );
      return true;
    },
    deleteProperty: function (target, property) {
      delete target[property];
      getPaths(target, property).forEach((path) => scheduleCallback(path));
      return true;
    },
  };

  let proxy = buildProxy(obj);

  return proxy;
};

export default proxy;
