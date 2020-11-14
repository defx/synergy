import parse from './parser.js';
import Proxy from './proxy.js';
import subscribe from './subscribe.js';
import hydrate from './hydrate.js';
import Updater from './update.js';

let counter = 1;

const templateFromString = (str) => {
  var tpl = document.createElement('template');
  tpl.innerHTML = str;
  return tpl;
};

function render(
  mountNode,
  viewmodel,
  template,
  { beforeMountCallback = () => {} } = {}
) {
  const BINDING_ID = counter++;

  let templateNode =
    typeof template === 'string' ? templateFromString(template) : template;

  let { subscribers, templateFragment } = parse(
    templateNode.cloneNode(true).content,
    BINDING_ID
  );

  let update = Updater(BINDING_ID);

  update(templateFragment, viewmodel);

  if (!hydrate(BINDING_ID, templateFragment, mountNode)) {
    beforeMountCallback(templateFragment);
    mountNode.appendChild(templateFragment);
  }

  let p = !!viewmodel.propertyChangedCallback;

  let proxy = Proxy(viewmodel, (changeset) => {
    update(mountNode, proxy);
    p &&
      changeset.forEach(([path, value]) =>
        proxy.propertyChangedCallback(path, value, mountNode)
      );
  });

  subscribe(mountNode, subscribers, proxy, BINDING_ID);

  return proxy;
}

export default render;
