import parse from './parser.js';
import subscribe from './subscribe.js';
import hydrate from './hydrate.js';
import Updater from './update.js';
import proxy from './proxy.js';
import { debounce, templateNode } from './helpers.js';

let counter = 1;

function render(mountNode, viewmodel, template) {
  const BINDING_ID = counter++;

  template = templateNode(template).content.cloneNode(true);

  let { subscribers, fragment } = parse(
    template,
    BINDING_ID
  );

  let vm;

  let update = Updater(BINDING_ID, (prev) => {
    if (vm && vm.updatedCallback) vm.updatedCallback(prev);
  });

  update(fragment, viewmodel);

  if (hydrate(BINDING_ID, fragment, mountNode)) {
    update(mountNode, viewmodel);
  } else {
    if (viewmodel.beforeMountCallback)
      viewmodel.beforeMountCallback(fragment);

    for (let child of mountNode.children) {
      if (child.nodeName !== 'SCRIPT') child.remove();
    }

    mountNode.appendChild(fragment);
  }

  vm = proxy(
    viewmodel,
    debounce(() => update(mountNode, viewmodel))
  );

  subscribe(mountNode, subscribers, vm, BINDING_ID);

  return vm;
}

export default render;
