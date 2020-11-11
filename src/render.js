import parse from './parser.js';
import Proxy from './proxy.js';
import subscribe from './subscribe.js';
import transferBindings from './transferBindings.js';
import Updater from './update.js';

function render(viewmodel, templateId, targetNodeId) {
  let mountNode = document.getElementById(targetNodeId);
  let template = document.getElementById(templateId);
  let { subscribers, templateNode } = parse(template.cloneNode(true).content);
  let update = Updater(templateNode);

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

  subscribe(mountNode, subscribers, proxy);

  return proxy;
}

export default render;
