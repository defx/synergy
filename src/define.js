import synergy from './index.js';
import mergeSlots from './mergeSlots.js';
import {
  templateFromString,
  applyAttribute,
  attributeToProp,
  isPrimitive,
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

function createDataScript(element) {
  let script = document.createElement('script');
  script.setAttribute('type', 'data');
  element.appendChild(script);
  return script;
}

function getDataScript(element) {
  return element.querySelector('script[type="data"]');
}

function setData(element, value) {
  let script =
    getDataScript(element) || createDataScript(element);
  script.textContent = JSON.stringify(value, null, 2);
}

function getData(element) {
  let script = getDataScript(element);
  return script && JSON.parse(script.textContent);
}

function addData(element, k, v) {
  let data = getData(element) || {};
  data[k] = v;
  setData(element, data);
}

const define = (name, factory, template, options = {}) => {
  let { observedAttributes = [] } = options;

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

      this.viewmodel = factory(
        initialAttributes(this),
        this
      );

      observedAttributes.forEach((name) => {
        let property = attributeToProp(name).name;

        let value = this.hasAttribute(name)
          ? this.getAttribute(name)
          : this[property];

        Object.defineProperty(this, property, {
          get() {
            return this.viewmodel[property];
          },
          set(v) {
            this.viewmodel[property] = v;

            if (isPrimitive(v)) {
              applyAttribute(this, property, v);
            } else {
              addData(this, property, v);
            }
          },
        });

        this[property] = value;
      });

      if (options.shadowRoot) {
        this.attachShadow({
          mode: options.shadowRoot,
        });
      } else {
        this.viewmodel.beforeMountCallback = (frag) =>
          mergeSlots(this, frag);
      }

      this.viewmodel = synergy.render(
        this.shadowRoot || this,
        this.viewmodel,
        template
      );

      let puc =
        this.viewmodel.updatedCallback || function () {};

      this.viewmodel.updatedCallback = (prev) => {
        observedProps.forEach((k) => {
          let v = this.viewmodel[k];
          isPrimitive(v) && applyAttribute(this, k, v);
        });

        puc.call(this.viewmodel, prev);
      };
    }
    attributeChangedCallback(k, _, v) {
      let { name, value } = attributeToProp(k, v);
      this.viewmodel[name] = value;
    }
  };

  forwards.forEach((k) =>
    Object.assign(X.prototype, {
      [k]() {
        this.viewmodel[k] && this.viewmodel[k]();
      },
    })
  );

  customElements.define(name, X);
};

export default define;
