import { subscribe } from './subscribe.js';
import { updater } from './update.js';
import { wrapProxy } from './proxy.js';
import { debounce, templateNode } from './helpers.js';
import { map } from './bindings.js';

export const render = (mountNode, viewmodel, template, extras = {}) => {
  let vm, mounted;

  let update = updater(
    mountNode,
    viewmodel,
    (prev) => mounted && viewmodel.updatedCallback(prev)
  );

  template = templateNode(template).cloneNode(true).content;

  let x = map(template, (node, bindings) => {
    node.$meta = node.$meta || { rootNode: mountNode, bindings: [] };
    node.$meta.bindings.unshift(...bindings);
  });

  if (!mountNode.$initData) {
    mountNode.$subscribe = x.events;

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
