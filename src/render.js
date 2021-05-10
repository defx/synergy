import { subscribe } from './subscribe.js';
import { updater } from './update.js';
import { wrapProxy } from './proxy.js';
import { debounce, templateNode } from './helpers.js';
import { map, apply } from './bindings.js';

export const render = (mountNode, viewmodel, template, extras = {}) => {
  let vm, mounted;

  let update = updater(
    mountNode,
    viewmodel,
    (prev) => mounted && viewmodel.updatedCallback(prev)
  );

  template = templateNode(template).cloneNode(true).content;

  let x = map(template);

  if (!mountNode.$initData) {
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
