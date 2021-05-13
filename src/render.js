import { subscribe } from './subscribe.js';
import { updater } from './update.js';
import { wrapProxy } from './proxy.js';
import { debounce, templateNode } from './helpers.js';
import { parse } from './xbindings.js';

export const render = (rootNode, viewmodel, template, extras = {}) => {
  let vm, mounted;

  let update = updater(
    rootNode,
    viewmodel,
    (prev) => mounted && viewmodel.updatedCallback(prev)
  );

  template = templateNode(template).content;

  let events = parse(template, (node, path, bindings) => {
    node.$meta = node.$meta || { rootNode, bindings: [] };
    node.$meta.bindings.unshift(...bindings);
  });

  if (!rootNode.$initData) {
    update(template);
    extras.beforeMountCallback?.(template);
    rootNode.textContent = '';
    rootNode.appendChild(template);
  }

  vm = wrapProxy(
    viewmodel,
    debounce(() => update(rootNode))
  );

  subscribe(rootNode, events, vm);

  mounted = true;

  window.vm = vm;

  return vm;
};
