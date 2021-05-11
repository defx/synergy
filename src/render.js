import { subscribe } from './subscribe.js';
import { updater } from './update.js';
import { wrapProxy } from './proxy.js';
import { debounce, templateNode } from './helpers.js';
import { parse } from './xbindings.js';

/*

the problem here is that we don't have a stable index.

the reason for that is that is actually something that is about to be solved....

because we iterate over the templates immediate children to assign the LIST_ITEM binding, that's when we see them for the second time.

ok! so simply assume that we only see each node once ;)

*/

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

  return vm;
};
