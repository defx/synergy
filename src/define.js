import { render } from './index.js';
import mergeSlots from './mergeSlots.js';
import {
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

function createDataScript(element) {
  let script = document.createElement('script');
  script.type = 'data';
  element.prepend(script);
  return script;
}

function getDataScript(element) {
  return element.querySelector('script[type="data"]');
}

function getData(element) {
  let script = getDataScript(element);
  return (script && JSON.parse(script.textContent)) || {};
}

function setData(element, k, v) {
  let data = getData(element);
  data[k] = v;
  let script =
    getDataScript(element) || createDataScript(element);
  script.textContent = JSON.stringify(data);
}

function wrap(target, property, fn) {
  let o = target[property];
  target[property] = function() {
    fn(...arguments);
    o?.(...arguments);
  }
}

const define = (name, factory, template, options = {}) => {
  let { observedAttributes = [], hooks = {} } = options;

  template = templateNode(template);

  let observedProps = observedAttributes.map(
    (v) => attributeToProp(v).name
  );

  let X = class extends HTMLElement {
    static get observedAttributes() {
      return observedAttributes;
    }
    constructor() {
      super();

      this.viewmodel = factory(initialAttributes(this));

      Object.assign(this, getData(this));

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
              setData(this, property, v);
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
        wrap(hooks, 'beforeMountCallback', (frag) =>
        mergeSlots(this, frag))
      }

      wrap(hooks, 'updatedCallback', (prev) => {

        /*
        
        @todo: check to see if the value actually changed!
        
        */

        observedProps.forEach((k) => {
          let v = this.viewmodel[k];
          if (isPrimitive(v)) {
            applyAttribute(this, k, v);
          } else {
            setData(this, k, v);
          }
        });
      })

      this.viewmodel = render(
        this.shadowRoot || this,
        this.viewmodel,
        template,
        { hooks }
      );
    }
    attributeChangedCallback(k, _, v) {
      let { name, value } = attributeToProp(k, v);
      this.viewmodel[name] = value;
    }
    connectedCallback() {
      hooks.connectedCallback?.(this.viewmodel)
    }
    disconnectedCallback() {
      hooks.disconnectedCallback?.(this.viewmodel)
    }
    adoptedCallback() {
      hooks.adoptedCallback?.(this.viewmodel)
    }
  };

  customElements.define(name, X);
};

export default define;