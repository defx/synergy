import synergy from './index.js';
import mergeSlots from './mergeSlots.js';
import {
  templateFromString,
  propToAttribute,
  attributeToProp,
} from './helpers.js';

const initialAttributes = (node) => {
  const o = {};
  for (let { name, value } of node.attributes) {
    let x = attributeToProp(name, value);
    o[x.name] = x.value;
  }
  return o;
};

const forwards = [
  'connectedCallback',
  'disconnectedCallback',
  'adoptedCallback',
];

const define = (
  name,
  factory,
  template,
  { observedAttributes = [] } = {}
) => {
  template =
    typeof template === 'string'
      ? templateFromString(template)
      : template;

  let observedProps = observedAttributes.map(
    (v) => attributeToProp(v).name
  );

  let X = class extends HTMLElement {
    static get observedAttributes() {
      return observedAttributes;
    }
    constructor() {
      super();

      let viewmodel = factory(
        initialAttributes(this),
        this
      );

      viewmodel.beforeMountCallback = (frag) =>
        mergeSlots(this, frag);

      this.viewmodel = synergy.render(
        this,
        viewmodel,
        template
      );

      let puc = viewmodel.updatedCallback || function () {};

      viewmodel.updatedCallback = (prev) => {
        observedProps
          .map((k) => [k, prev[k], viewmodel[k]])
          .filter(([_, a, b]) => a !== b)
          .forEach(([k, _, v]) => {
            this.updateAttribute(k, v);
          });

        puc.call(this.viewmodel, prev);
      };
    }
    updateAttribute(k, v) {
      let { name, value } = propToAttribute(k, v);
      if (value) {
        this.setAttribute(name, value);
      } else {
        this.removeAttribute(name);
      }
    }
    attributeChangedCallback(k, _, v) {
      if (this.viewmodel) {
        let { name, value } = attributeToProp(k, v);
        this.viewmodel[name] = value;
      }
    }
  };

  forwards.forEach((k) =>
    Object.assign(X.prototype, {
      [k]() {
        if (this.viewmodel && this.viewmodel[k])
          this.viewmodel[k]();
      },
    })
  );

  customElements.define(name, X);
};

export default define;
