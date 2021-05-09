import { subscribe } from './subscribe.js';
import { updater } from './update.js';
import { wrapProxy } from './proxy.js';
import { debounce, templateNode } from './helpers.js';
import { map, apply } from './bindings.js';

let cache = new Map();
let masterNode;

export const render = (mountNode, viewmodel, template, extras = {}) => {
  let vm, mounted;

  let update = updater(
    mountNode,
    viewmodel,
    (prev) => mounted && viewmodel.updatedCallback(prev)
  );

  if (!cache.has(template)) {
    masterNode = templateNode(template).cloneNode(true);
    cache.set(template, map(masterNode.content));
  }

  let x = cache.get(template);

  if (!mountNode.$initData) {
    template = masterNode.cloneNode(true).content;

    mountNode.$subscribe = x.events;

    apply(x, template, mountNode);

    update(template);

    extras.beforeMountCallback?.(template);

    for (let child of mountNode.children) {
      child.remove();
    }

    mountNode.appendChild(template);
  }

  vm = wrapProxy(
    viewmodel,
    debounce(() => update(mountNode))
  );

  subscribe(mountNode, mountNode.$subscribe, vm);

  mounted = true;

  return vm;
};
