import { debounce } from './helpers.js';

function observer() {
  let subscribers = [];
  let updates = {};

  let queueCallback = debounce(function () {
    Object.entries(updates).forEach(([name, value]) => {
      let fns = subscribers[name] || [];
      fns.forEach((fn) => fn(value));
    });
    updates = {};
  });

  return {
    transmit(name, value) {
      updates[name] = value;
      queueCallback();
    },
    subscribe(name, fn) {
      subscribers[name] = subscribers[name] || [];
      subscribers[name].push(fn);
    },
  };
}

export default observer;
