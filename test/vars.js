import { define } from '../src/index.js';

const html = (strings, ...values) => strings.reduce((a, v, i) => a + v + (values[i] || ''), '');

const mount = (v) => {
  let node = document.body;

  node.innerHTML = '';

  if (typeof v === 'string') node.innerHTML = v;

  if (v.nodeName) node.appendChild(v);

  return node.firstChild;
};

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const textContent = (node) => node.textContent.trim();

window.synergy = { define };
window.mount = mount;
window.html = html;
window.nextFrame = nextFrame;
window.assert = assert;
window.textContent = textContent;
window.$ = (v) => document.querySelector(v);
window.$$ = (v) => Array.from(document.querySelectorAll(v));

let count = 0;

window.createName = () => `x-${count++}`;
