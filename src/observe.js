/*

given target, will 

*/

function observe(
  root = {},
  properties = [],
  callback
) {
  let observed = new Map();

  function scheduleCallback() {
    requestAnimationFrame(() => {
      Array.from(observed).forEach(([k, v]) =>
        callback(k, v)
      );
      observed = new Map();
    });
  }

  const handler = {
    get(target, property) {
      if (properties.includes(property)) {
        //...
      }
    },
    set(target, property, value) {
      if (
        target === root &&
        properties.includes(property)
      ) {
        observed.set(property, value);
        scheduleCallback();
      }
    },
  };
  return new Proxy(root, handler);
}
