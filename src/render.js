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

  let update = Updater(BINDING_ID, (prev) => {
    if (viewmodel.postUpdateCallback)
      viewmodel.postUpdateCallback(prev);
  });

  update(templateFragment, viewmodel);

  if (hydrate(BINDING_ID, templateFragment, mountNode)) {
    /* it doesn't have to be a perfect match to hydrate, but we do want to patch the differences. This is an intentional strategy aimed at allowing you to design for users that might have JS turned off by stripping stateful attributes (e.g., [hidden],[disabled],[aria-expanded],etc) from your pre-rendered HTML to avoid dead-end situations where (for example) something is serialised with [hidden] but then there's no JS to unhide it. If your HTML isn't mismatched then this invocation of update won't touch the DOM.  */
    update(mountNode, viewmodel);
  } else {
    if (viewmodel.beforeMountCallback)
      viewmodel.beforeMountCallback(templateFragment);

    while (mountNode.firstChild) {
      mountNode.removeChild(mountNode.lastChild);
    }

    mountNode.appendChild(templateFragment);
  }

  let vm = proxy(
    viewmodel,
    debounce(() => update(mountNode, viewmodel))
  );

  subscribe(mountNode, subscribers, vm, BINDING_ID);

  return vm;
}

export default render;
