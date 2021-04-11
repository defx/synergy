import { bind } from './bind.js';
import { subscribe } from './subscribe.js';
import { updater } from './update.js';
import { wrapProxy } from './proxy.js';
import { debounce, templateNode } from './helpers.js';

let counter = 1;

export const render = (mountNode, viewmodel, template, extras = {}) => {
  const BINDING_ID = mountNode.bindingId || counter++;
  mountNode.bindingId = BINDING_ID;

  let vm, mounted;

  let update = updater(BINDING_ID, (prev) => mounted && viewmodel.updatedCallback(prev));

  if (!mountNode.$initData) {
    template = templateNode(template).cloneNode(true).content;

    mountNode.$subscribe = bind(template, BINDING_ID);

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

  subscribe(mountNode, mountNode.$subscribe, vm, BINDING_ID);

  mounted = true;

  return vm;
};
