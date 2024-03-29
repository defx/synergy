import { configure } from "./update.js"
import { render } from "./render.js"
import { mergeSlots } from "./mergeSlots.js"
import { appendStyles } from "./css.js"
import {
  applyAttribute,
  attributeToProp,
  isPrimitive,
  pascalToKebab,
  getDataScript,
  createDataScript,
} from "./helpers.js"

function serialise(node, state) {
  let ds = getDataScript(node) || createDataScript(node)
  ds.innerText = JSON.stringify(state)
}

export const define = (name, factory, template, css) => {
  if (customElements.get(name)) return

  if (css) appendStyles(name, css)

  customElements.define(
    name,
    class extends HTMLElement {
      async connectedCallback() {
        if (!this.initialised) {
          let config = factory(this)

          if (config instanceof Promise) config = await config

          let { subscribe, shadow, observe = [] } = config

          this.connectedCallback = config.connectedCallback
          this.disconnectedCallback = config.disconnectedCallback

          const ds = getDataScript(this)

          const { dispatch, getState, onChange, updated, refs } = configure(
            {
              ...config,
              state: ds ? JSON.parse(ds.innerText) : config.state,
            },
            this
          )

          this.store = { dispatch, getState }

          let state = getState()

          let observedAttributes = observe.map(pascalToKebab)

          let sa = this.setAttribute
          this.setAttribute = (k, v) => {
            if (observedAttributes.includes(k)) {
              let { name, value } = attributeToProp(k, v)

              dispatch({
                type: "SET",
                payload: { name, value },
              })
            }
            sa.apply(this, [k, v])
          }
          let ra = this.removeAttribute
          this.removeAttribute = (k) => {
            if (observedAttributes.includes(k)) {
              let { name, value } = attributeToProp(k, null)
              dispatch({
                type: "SET",
                payload: { name, value },
              })
            }
            ra.apply(this, [k])
          }

          observedAttributes.forEach((name) => {
            let property = attributeToProp(name).name
            let value

            if (this.hasAttribute(name)) {
              value = this.getAttribute(name)
            } else {
              value = this[property] || state[property]
            }

            Object.defineProperty(this, property, {
              get() {
                return getState()[property]
              },
              set(v) {
                dispatch({
                  type: "SET",
                  payload: { name: property, value: v },
                })
                if (isPrimitive(v)) {
                  applyAttribute(this, property, v)
                }
              },
            })

            this[property] = value
          })

          let beforeMountCallback

          if (shadow) {
            this.attachShadow({
              mode: shadow,
            })
          } else {
            beforeMountCallback = (frag) => mergeSlots(this, frag)
          }

          onChange(
            render(
              this.shadowRoot || this,
              { getState, dispatch, refs },
              template,
              () => {
                const state = getState()

                serialise(this, state)
                observe.forEach((k) => {
                  let v = state[k]
                  if (isPrimitive(v)) applyAttribute(this, k, v)
                })
                subscribe?.(getState())
                updated()
              },
              beforeMountCallback
            )
          )

          if (!ds) serialise(this, getState())
        }

        if (!this._C) this.connectedCallback?.(this.store)
        this._C = false
      }
      disconnectedCallback() {
        this._C = true
        requestAnimationFrame(() => {
          if (this._C) this.disconnectedCallback?.()
          this._C = false
        })
      }
    }
  )
}
