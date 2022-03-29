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

function serialise(node, state) {
  let ds = getDataScript(node) || createDataScript(node)

  ds.innerText = JSON.stringify(state)
}

function deserialise(node) {
  return JSON.parse(getDataScript(node)?.innerText || "{}")
}

let count = 0

function nextId() {
  return count++
}

export const define = (name, factory, template) =>
  customElements.define(
    name,
    class extends HTMLElement {
      async connectedCallback() {
        if (!this.initialised) {
          let config = factory(this)
          const slice = `name.${nextId()}`

          if (config instanceof Promise) config = await config

          let {
            update,
            middleware,
            derivations,
            subscribe,
            shadow,
            initialState = {},
          } = config

          this.connectedCallback = config.connectedCallback
          this.disconnectedCallback = config.disconnectedCallback

          const { dispatch, getState, onUpdate, flush } = configure(
            update,
            middleware,
            derivations,
            initialState
          )

          dispatch({
            type: "MERGE",
            payload: deserialise(this),
          })

          initialState = getState()

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

          if (shadow) {
            this.attachShadow({
              mode: shadow,
            })
          } else {
            beforeMountCallback = (frag) => mergeSlots(this, frag)
          }

          onUpdate(
            render(
              this.shadowRoot || this,
              { getState, dispatch },
              template,
              () => {
                serialise(this, getState())

                observedProps.forEach((k) => {
                  let v = getState()[k]
                  if (isPrimitive(v)) applyAttribute(this, k.slice(1), v)
                })
                subscribe?.(getState())
                flush()
              },
              beforeMountCallback
            )
          )
          this.initialised = true
        }
        this.connectedCallback?.()
      }
      disconnectedCallback() {
        this.disconnectedCallback?.()
      }
    }
  )
