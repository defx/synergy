import { define, render } from '../src/index.js';

const html = (strings, ...values) =>
  strings.reduce(
    (a, v, i) => a + v + (values[i] || ''),
    ''
  );

const mount = (html) => {
  let node = document.body;
  node.innerHTML = html;
  return node.firstChild;
};

const nextFrame = () =>
  new Promise((resolve) =>
    requestAnimationFrame(resolve)
  );

const textContent = (node) =>
  node.textContent.trim();

window.synergy = { define, render };
window.mount = mount;
window.html = html;
window.nextFrame = nextFrame;
window.assert = assert;
window.textContent = textContent;
window.$ = (v) => document.querySelector(v);
window.$$ = (v) =>
  Array.from(document.querySelectorAll(v));
