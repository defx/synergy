import parse from './parser.js';
import subscribe from './subscribe.js';
import Updater from './update.js';
import proxy from './proxy.js';
import hydrate from './hydrate.js';
import { debounce, templateNode } from './helpers.js';

let counter = 1;

const render = (mountNode, viewmodel, template, options = {}, extras = {}) => {
  const BINDING_ID = counter++;

  template = templateNode(template).cloneNode(true).content;

  let { subscribers, templateFragment } = parse(template, BINDING_ID);

  let vm, mounted;

  let update = Updater(
    BINDING_ID,
    (prev) => mounted && options.lifecycle?.updatedCallback?.(mountNode, vm, prev)
  );

  update(templateFragment, viewmodel);

  if (mountNode.hasAttribute?.('x-o')) {
    hydrate(BINDING_ID, templateFragment, mountNode);
  } else {
    extras.beforeMountCallback?.(templateFragment);

    for (let child of mountNode.children) {
      if (child.nodeName !== 'SCRIPT') child.remove();
    }

    mountNode.appendChild(templateFragment);
  }

  vm = proxy(
    viewmodel,
    debounce(() => update(mountNode, viewmodel))
  );

  subscribe(mountNode, subscribers, vm, BINDING_ID);

  mounted = true;

  return vm;
};

export default render;
