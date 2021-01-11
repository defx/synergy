import parse from './parser.js';
import subscribe from './subscribe.js';
import hydrate from './hydrate.js';
import Updater from './update.js';
import proxy from './proxy.js';
import { debounce, templateFromString } from './helpers.js';

let counter = 1;

function render(
  mountNode,
  viewmodel,
  template,
  options = {}
) {
  const BINDING_ID = counter++;

  let templateNode = (typeof template === 'string'
    ? templateFromString(template)
    : template
  ).cloneNode(true).content;

  let { subscribers, templateFragment } = parse(
    templateNode,
    BINDING_ID
  );

  let vm;

  let update = Updater(BINDING_ID, (prev) => {
    if (vm && vm.updatedCallback) vm.updatedCallback(prev);
  });

  update(templateFragment, viewmodel);

  if (hydrate(BINDING_ID, templateFragment, mountNode)) {
    update(mountNode, viewmodel);
  } else {
    if (viewmodel.beforeMountCallback)
      viewmodel.beforeMountCallback(templateFragment);

    while (mountNode.firstChild) {
      mountNode.removeChild(mountNode.lastChild);
    }

    mountNode.appendChild(templateFragment);
  }

  vm = proxy(
    viewmodel,
    debounce(() => update(mountNode, viewmodel))
  );

  subscribe(mountNode, subscribers, vm, BINDING_ID);

  return vm;
}

export default render;
