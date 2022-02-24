import { render } from "./render.js"
import { mergeSlots } from "./mergeSlots.js"
import {
  applyAttribute,
  attributeToProp,
  isPrimitive,
  pascalToKebab,
} from "./helpers.js"

export const define = (name, factory, template, options = {}) =>
  customElements.define(
    name,
    class extends HTMLElement {
      async connectedCallback() {
        if (!this.initialised) {
          this.$viewmodel = factory(this)

          if (this.$viewmodel instanceof Promise)
            this.$viewmodel = await this.$viewmodel

          let observedProps = Object.keys(this.$viewmodel).filter(
            (v) => v.charAt(0) === "$"
          )

          let observedAttributes = observedProps
            .map((v) => v.slice(1))
            .map(pascalToKebab)

          let sa = this.setAttribute
          this.setAttribute = (k, v) => {
            if (observedAttributes.includes(k)) {
              let { name, value } = attributeToProp(k, v)
              this.$viewmodel["$" + name] = value
            }
            sa.apply(this, [k, v])
          }

          observedAttributes.forEach((name) => {
            let property = attributeToProp(name).name

            let value

            if (this.hasAttribute(name)) {
              value = this.getAttribute(name)
            } else {
              value = this[property] || this.$viewmodel["$" + property]
            }

            Object.defineProperty(this, property, {
              get() {
                return this.$viewmodel["$" + property]
              },
              set(v) {
                this.$viewmodel["$" + property] = v
                if (isPrimitive(v)) {
                  applyAttribute(this, property, v)
                }
              },
            })

            this[property] = value
          })

          let beforeMountCallback

          if (options.shadow) {
            this.attachShadow({
              mode: options.shadow,
            })
          } else {
            beforeMountCallback = (frag) => mergeSlots(this, frag)
          }

          this.$viewmodel = render(
            this.shadowRoot || this,
            this.$viewmodel,
            template,
            () => {
              observedProps.forEach((k) => {
                let v = this.$viewmodel[k]
                if (isPrimitive(v)) applyAttribute(this, k.slice(1), v)
              })
            },
            beforeMountCallback
          )
          this.initialised = true
        }
        this.$viewmodel.connectedCallback?.()
      }
      disconnectedCallback() {
        this.$viewmodel?.disconnectedCallback?.()
      }
    }
  )
