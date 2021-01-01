import synergy from './index.js';
import prefixSelectors from './prefixSelectors.js';
import mergeSlots from './mergeSlots.js';
import { templateFromString } from './helpers.js';

const initialAttributes = (node) => {
  const o = {};
  for (let { name, value } of node.attributes) {
    o[name] = value === '' ? true : value;
  }
  return o;
};

const wrap = (target, name, method) => {
  let originalMethod = target[name] || (() => {});
  target[name] = function () {
    method(...arguments);
    originalMethod(...arguments);
  };
};

const forwards = [
  'connectedCallback',
  'disconnectedCallback',
  'adoptedCallback',
];

function stylesExistInDoc(name) {
  return document.querySelector(
    `head style[id="synergy-${name}"]`
  );
}

function mountStyles(name, css) {
  let el = document.createElement('style');
  el.textContent = css;
  el.id = `synergy-${name}`;
  document.head.appendChild(el);
}

const define = (
  name,
  factory,
  template,
  { observedAttributes = [] } = {}
) => {
  if (typeof template === 'string')
    template = templateFromString(template);
  let styleNode = template.content.querySelector(
    'style[scoped]'
  );

  if (styleNode && !stylesExistInDoc(name)) {
    mountStyles(
      name,
      prefixSelectors(name, styleNode.textContent)
    );
    styleNode.remove();
  }

  let X = class extends HTMLElement {
    static get observedAttributes() {
      return observedAttributes;
    }
    constructor() {
      super();

      let props = initialAttributes(this);

      let viewmodel = factory(props, this);

      wrap(
        viewmodel,
        'propertyChangedCallback',
        (k, v) => {
          if (observedAttributes.includes(k)) {
            if (v || v === '') {
              this.setAttribute(k, v);
            } else {
              this.removeAttribute(k);
            }
          }
        }
      );

      viewmodel.beforeMountCallback = (frag) =>
        mergeSlots(this, frag);

      this.viewmodel = synergy.render(
        this,
        viewmodel,
        template
      );
    }
    attributeChangedCallback(k, _, v) {
      if (this.viewmodel)
        this.viewmodel[k] = v === '' ? true : v;
    }
  };

  forwards.forEach((k) =>
    Object.assign(X.prototype, {
      [k](...args) {
        if (this.viewmodel && this.viewmodel[k])
          this.viewmodel[k](...args);
      },
    })
  );

  customElements.define(name, X);
};

export default define;
