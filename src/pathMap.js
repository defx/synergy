export default () => {
  let valueToPaths = new WeakMap();
  let pathToId = new Map();
  let id = 0;

  return {
    appendAll(value, paths) {
      if (!valueToPaths.has(value)) valueToPaths.set(value, new Map());
      const map = valueToPaths.get(value);
      for (let path of paths) {
        map.set(path, ++id);
        pathToId.set(path, id);
      }
      valueToPaths.set(value, map);
    },
    get(value) {
      if (!valueToPaths.has(value)) return [];

      const entries = Array.from(valueToPaths.get(value)).filter(
        ([path, id]) => pathToId.get(path) === id
      );
      valueToPaths.set(value, new Map(entries));
      return entries.map(([path, id]) => path);
    },
  };
};
