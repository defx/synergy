import { configure } from "./update.js"
import { render } from "./render.js"
import { mergeSlots } from "./mergeSlots.js"
import {
  applyAttribute,
  attributeToProp,
  isPrimitive,
  pascalToKebab,
} from "./helpers.js"

function getDataScript(node) {
  return node.querySelector(`script[type="application/synergy"]`)
}

function createDataScript(node) {
  let ds = document.createElement("script")
  ds.setAttribute("type", "application/synergy")
  node.append(ds)
  return ds
}

function serialise(node) {
  let ds = getDataScript(node) || createDataScript(node)
  ds.innerText = JSON.stringify(node.$viewmodel)
}

function deserialise(node) {
  return JSON.parse(getDataScript(node)?.innerText || "{}")
}

export const define = (name, factory, template, options = {}) =>
  customElements.define(
    name,
    class extends HTMLElement {
      async connectedCallback() {
        if (!this.initialised) {
          // const { dispatch, getState } = configure()

          let config = factory(this)

          if (config instanceof Promise) config = await config

          const { update } = config

          const { dispatch, getState, subscribe } = configure(update)

          dispatch({
            type: "MERGE",
            payload: deserialise(this),
          })

          let initialState = getState()

          let observedProps = Object.keys(initialState).filter(
            (v) => v.charAt(0) === "$"
          )

          let observedAttributes = observedProps
            .map((v) => v.slice(1))
            .map(pascalToKebab)

          let sa = this.setAttribute
          this.setAttribute = (k, v) => {
            if (observedAttributes.includes(k)) {
              let { name, value } = attributeToProp(k, v)
              // this.$viewmodel["$" + name] = value
              dispatch({
                type: "SET",
                payload: { name: "$" + name, value },
              })
            }
            sa.apply(this, [k, v])
          }

          observedAttributes.forEach((name) => {
            let property = attributeToProp(name).name

            let value

            if (this.hasAttribute(name)) {
              value = this.getAttribute(name)
            } else {
              value = this[property] || initialState["$" + property]
            }

            Object.defineProperty(this, property, {
              get() {
                return getState()["$" + property]
              },
              set(v) {
                // this.$viewmodel["$" + property] = v
                dispatch({
                  type: "SET",
                  payload: { name: "$" + property, value: v },
                })
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
            { getState, dispatch, subscribe },
            template,
            () => {
              serialise(this)

              observedProps.forEach((k) => {
                // let v = this.$viewmodel[k]
                let v = getState()[k]
                if (isPrimitive(v)) applyAttribute(this, k.slice(1), v)
              })
            },
            beforeMountCallback
          )
          this.initialised = true
        }
        // this.$viewmodel.connectedCallback?.()
      }
      disconnectedCallback() {
        // this.$viewmodel?.disconnectedCallback?.()
      }
    }
  )
