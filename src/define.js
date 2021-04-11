import { render } from './render.js';
import { mergeSlots } from './mergeSlots.js';
import { applyAttribute, attributeToProp, isPrimitive, pascalToKebab } from './helpers.js';

const wrap = (target, property, fn) => {
  let o = target[property];
  target[property] = function () {
    fn(...arguments);
    o?.apply(target, arguments);
  };
};

export const define = (name, factory, template, options = {}) => {
  customElements.define(
    name,
    class extends HTMLElement {
      async connectedCallback() {
        if (!this.initialised) {
          let observedProps = new Set();
          let self = this;
          let hydrate = this.$initData;

          if (hydrate) Object.assign(this, this.$initData);

          let x = factory(
            new Proxy(
              {},
              {
                get(_, prop) {
                  let attr = pascalToKebab(prop);
                  observedProps.add(prop);
                  return (self.hasAttribute(attr) && self.getAttribute(attr)) || self[prop];
                },
              }
            ),
            this
          );

          this.$ = x instanceof Promise ? await x : x;

          observedProps = Array.from(observedProps);

          let observedAttributes = observedProps.map(pascalToKebab);

          let sa = this.setAttribute;
          this.setAttribute = (k, v) => {
            if (observedAttributes.includes(k)) {
              let { name, value } = attributeToProp(k, v);
              this.$[name] = value;
            }
            sa.apply(this, [k, v]);
          };

          let d = observedAttributes.reduce((o, name) => {
            let property = attributeToProp(name).name;

            let value;

            if (this.hasAttribute(name)) {
              value = this.getAttribute(name);
            } else {
              value = this[property] || this.$[property];
            }

            Object.defineProperty(this, property, {
              get() {
                return this.$[property];
              },
              set(v) {
                this.$[property] = v;

                if (isPrimitive(v)) {
                  applyAttribute(this, property, v);
                }
              },
            });

            this[property] = value;

            o[property] = value;
            return o;
          }, {});

          let extras = {
            hydrate,
          };

          if (options.shadow) {
            this.attachShadow({
              mode: options.shadow,
            });
          } else {
            extras.beforeMountCallback = (frag) => mergeSlots(this, frag);
          }

          wrap(this.$, 'updatedCallback', () => {
            observedProps.forEach((k) => {
              let v = this.$[k];
              if (isPrimitive(v)) applyAttribute(this, k, v);
            });
          });

          this.$ = render(this.shadowRoot || this, this.$, template, extras);

          this.initialised = true;
          this.$initData = d;
        }

        this.$.connectedCallback?.(this.$);
      }
      disconnectedCallback() {
        this.$?.disconnectedCallback?.(this.$);
      }
    }
  );
};
