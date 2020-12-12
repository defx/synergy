export default () => {
  let c = new WeakMap();
  let id = {};
  let nextId = (k) => (id[k] = (id[k] || 0) + 1);
  return {
    get(value) {
      let x = Array.from(c.get(value) || []).filter(([k, v]) => v === id[k]);
      c.set(new Map(x));
      return x.map(([k]) => k);
    },
    set(value, paths) {
      let x = c.get(value) || new Map();
      paths.forEach((path) => x.set(path, nextId(path)));
      c.set(value, x);
    },
  };
};
