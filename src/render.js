import parse from './parser.js';
import Proxy from './proxy.js';
import subscribe from './subscribe.js';
import transferBindings from './transferBindings.js';
import Updater from './update.js';

function render(mountNode, model, template, options = {}) {
  let { subscribers, rootNode } = parse(template);
  let update = Updater(rootNode);

  update(rootNode, model);

  if (rootNode.innerHTML === mountNode.innerHTML) {
    transferBindings(rootNode, mountNode);
  } else {
    mountNode.innerHTML = '';
    while (rootNode.childNodes.length > 0) {
      mountNode.appendChild(rootNode.childNodes[0]);
    }
  }

  let p = !!model.propertyChangedCallback;

  let proxy = Proxy(model, (changeset) => {
    update(mountNode, proxy);
    p &&
      changeset.forEach(([path, value]) =>
        proxy.propertyChangedCallback(path, value, mountNode)
      );
  });

  subscribe(mountNode, subscribers, proxy);

  if (proxy.connectedCallback) proxy.connectedCallback(mountNode);

  return proxy;
}

export default render;
