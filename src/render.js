import { bind } from './bind.js';
import { subscribe } from './subscribe.js';
import { updater } from './update.js';
import { wrapProxy } from './proxy.js';
import { debounce, templateNode } from './helpers.js';

export const render = (mountNode, viewmodel, template, extras = {}) => {
  let vm, mounted;

  let update = updater(mountNode, (prev) => mounted && viewmodel.updatedCallback(prev));

  if (!mountNode.$initData) {
    template = templateNode(template).cloneNode(true).content;

    mountNode.$subscribe = bind(template, mountNode);

    update(template, viewmodel);

    extras.beforeMountCallback?.(template);

    for (let child of mountNode.children) {
      child.remove();
    }

    mountNode.appendChild(template);
  }

  vm = wrapProxy(
    viewmodel,
    debounce(() => update(mountNode, viewmodel))
  );

  subscribe(mountNode, mountNode.$subscribe, vm);

  mounted = true;

  return vm;
};
