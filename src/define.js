import render from './render.js';
import mergeSlots from './mergeSlots.js';
import {
  getDataScript,
  templateNode,
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

const createDataScript = (element) => {
  let script = document.createElement('script');
  script.type = 'data';
  element.prepend(script);
  return script;
};

const wrap = (target, property, fn) => {
  let o = target[property];
  target[property] = function () {
    fn(...arguments);
    o?.(...arguments);
  };
};

const define = (name, factory, template, options = {}) => {
  let { observe = [], lifecycle = {} } = options;

  template = templateNode(template);

  let observedProps = observe.map((v) => attributeToProp(v).name);
  customElements.define(
    name,
    class extends HTMLElement {
      static get observedAttributes() {
        return observe;
      }
      constructor() {
        super();
        this.viewmodel = {};
      }
      attributeChangedCallback(k, _, v) {
        let { name, value } = attributeToProp(k, v);
        this.viewmodel[name] = value;
      }

      connectedCallback() {
        if (!this.initialised) {
          this.viewmodel = factory(initialAttributes(this), this);

          observe.forEach((name) => {
            let property = attributeToProp(name).name;

            let value;

            if (this.hasAttribute(name)) {
              value = this.getAttribute(name);
            } else {
              value = this[property] || this.viewmodel[property];
            }

            Object.defineProperty(this, property, {
              get() {
                return this.viewmodel[property];
              },
              set(v) {
                this.viewmodel[property] = v;

                if (isPrimitive(v)) {
                  applyAttribute(this, property, v);
                }
              },
            });

            this[property] = value;
          });

          let extras = {};

          if (options.shadow) {
            this.attachShadow({
              mode: options.shadow,
            });
          } else {
            extras.beforeMountCallback = (frag) => mergeSlots(this, frag);
          }

          wrap(lifecycle, 'updatedCallback', () => {
            observedProps.forEach((k) => {
              let v = this.viewmodel[k];
              if (isPrimitive(v)) applyAttribute(this, k, v);
            });
          });

          this.viewmodel = render(
            this.shadowRoot || this,
            this.viewmodel,
            template,
            { lifecycle },
            extras
          );

          createDataScript(this);

          this.initialised = true;
        }

        lifecycle.connectedCallback?.(this.viewmodel);
      }
      disconnectedCallback() {
        lifecycle.disconnectedCallback?.(this.viewmodel);
      }
    }
  );
};

export default define;
