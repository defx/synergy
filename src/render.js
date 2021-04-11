import { bind } from './parser.js';
import { subscribe } from './subscribe.js';
import { updater } from './update.js';
import { wrapProxy } from './proxy.js';
import { debounce, templateNode } from './helpers.js';

let counter = 1;

export const render = (mountNode, viewmodel, template, extras = {}) => {
  /*
  @todo: make it not flakey
  */
  const BINDING_ID = mountNode.bindingId || counter++;
  mountNode.bindingId = BINDING_ID;

  let vm, mounted;

  let update = updater(BINDING_ID, (prev) => mounted && viewmodel.updatedCallback(prev));

  if (!mountNode.$initData) {
    template = templateNode(template).cloneNode(true).content;

    let x = bind(template, BINDING_ID);

    mountNode.subscribers = x.subscribers;

    update(x.templateFragment, viewmodel);

    extras.beforeMountCallback?.(x.templateFragment);

    for (let child of mountNode.children) {
      child.remove();
    }

    mountNode.appendChild(x.templateFragment);
  }

  vm = wrapProxy(
    viewmodel,
    debounce(() => update(mountNode, viewmodel))
  );

  subscribe(mountNode, mountNode.subscribers, vm, BINDING_ID);

  mounted = true;

  return vm;
};
