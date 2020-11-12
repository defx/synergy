import parse from './parser.js';
import Proxy from './proxy.js';
import subscribe from './subscribe.js';
import transferBindings from './transferBindings.js';
import Updater from './update.js';

let count = 0;

function render(viewmodel, templateId, targetNodeId) {
  const BINDING_ID = count++;
  let mountNode = document.getElementById(targetNodeId);
  let template = document.getElementById(templateId);
  let { subscribers, templateNode } = parse(
    template.cloneNode(true).content,
    BINDING_ID
  );
  let update = Updater(BINDING_ID);

  update(templateNode, viewmodel);

  if (templateNode.innerHTML === mountNode.innerHTML) {
    transferBindings(templateNode, mountNode);
  } else {
    mountNode.innerHTML = '';
    mountNode.appendChild(templateNode);
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
