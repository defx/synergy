import synergy from '../src/index.js';

const html = (strings, ...values) =>
  strings.reduce((a, v, i) => a + v + (values[i] || ''), '');

const mount = (html) => {
  let node = document.body;
  node.innerHTML = html;
  return node.firstChild;
};

const nextUpdate = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));

const textContent = (node) => node.textContent.trim();

window.synergy = synergy;
window.mount = mount;
window.html = html;
window.nextUpdate = nextUpdate;
window.assert = assert;
window.textContent = textContent;
