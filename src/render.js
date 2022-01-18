import { TEXT, ATTRIBUTE, INPUT, EVENT, REPEAT } from "./constants.js"
import { updateFormControl } from "./formControl.js"
import {
  callFunctionAtPath,
  debounce,
  fragmentFromTemplate,
  getValueAtPath,
  last,
  setValueAtPath,
  walk,
  typeOf,
} from "./helpers.js"
import { compareKeyedLists, getBlocks, parseEach, updateList } from "./list.js"
import { proxy } from "./proxy.js"
import {
  getParts,
  getValueFromParts,
  hasMustache,
  parseEventHandler,
} from "./token.js"
import { applyAttribute } from "./attribute.js"

const HYDRATE_ATTR = "synergy-hydrate"

export const render = (
  target,
  model,
  template,
  updatedCallback,
  beforeMountCallback
) => {
  let observer = () => {
    let subscribers = new Set()
    return {
      publish: (cb) => {
        for (let fn of subscribers) {
          fn()
        }
        cb?.()
      },
      subscribe(fn) {
        subscribers.add(fn)
      },
    }
  }

  const _ = (a, b) => (a === undefined ? b : a)

  const createSubscription = {
    [TEXT]: ({ value, node, model }) => {
      return {
        handler: () => {
          let a = node.textContent
          let b = getValueFromParts(model, getParts(value))
          if (a !== b) node.textContent = b
        },
      }
    },
    [ATTRIBUTE]: ({ value, node, model, name }) => {
      return {
        handler: () => {
          let b = getValueFromParts(model, getParts(value))
          applyAttribute(node, name, b)
        },
      }
    },
    [INPUT]: ({ node, model, path }) => {
      node.addEventListener("input", () => {
        let value =
          node.getAttribute("type") === "checkbox" ? node.checked : node.value

        if (value.trim?.().length && !isNaN(value)) value = +value

        setValueAtPath(path, value, model)
      })
      return {
        handler: () => {
          // let a = node.value;
          let b = getValueAtPath(path, model)
          updateFormControl(node, b)
        },
      }
    },
    [EVENT]: ({ node, model, eventType, event, method, args }) => {
      node.addEventListener(eventType, (e) => {
        let x = args
          ? args.map((v) => (v === event ? e : _(getValueAtPath(v, model), v)))
          : []

        let fn = callFunctionAtPath(method, model, x)

        if (fn) {
          requestAnimationFrame(fn)
        }
      })
      return {
        handler: () => {},
      }
    },
    [REPEAT]: ({
      node,
      model,
      map,
      path,
      identifier,
      index,
      key,
      blockIndex,
      hydrate,
      pickupNode,
    }) => {
      let oldValue
      node.$t = blockIndex - 1

      const initialiseBlock = (rootNode, i, k, exitNode) => {
        let wrapper = new Proxy(model, {
          get(_, property) {
            let x = getValueAtPath(path, model)

            if (property === identifier) {
              for (let n in x) {
                let v = x[n]
                if (key) {
                  if (v[key] === k) return v
                } else {
                  if (n == i) return v
                }
              }
            }

            if (property === index) {
              for (let n in x) {
                let v = x[n]
                if (key) {
                  if (v[key] === k) return n
                } else {
                  if (n == i) return n
                }
              }
            }

            if (x[i]?.hasOwnProperty?.(property)) return x[i][property]

            return Reflect.get(...arguments)
          },
          set(_, property, value) {
            let x = getValueAtPath(path, model)

            if (x[i]?.hasOwnProperty?.(property)) {
              return (x[i][property] = value)
            }

            return Reflect.set(...arguments)
          },
        })

        walk(
          rootNode,
          multi(
            (node) => {
              if (node === exitNode) return false
            },
            bindAll(wrapper, map, hydrate),
            (child) => (child.$t = blockIndex)
          )
        )
      }

      function firstChild(v) {
        return (v.nodeType === v.DOCUMENT_FRAGMENT_NODE && v.firstChild) || v
      }

      const createListItem = (datum, i) => {
        let k = datum[key]
        let frag = fragmentFromTemplate(node)
        initialiseBlock(firstChild(frag), i, k)
        return frag
      }

      if (hydrate) {
        let x = getValueAtPath(path, model)
        let length = typeOf(x) === "Object" ? Object.keys(x).length : x.length
        let blocks = getBlocks(node, length)
        blocks.forEach((block, i) => {
          let datum = x[i]
          let k = datum[key]
          initialiseBlock(block[0], i, k, last(block).nextSibling)
        })
        pickupNode = last(last(blocks)).nextSibling
      }

      return {
        handler: () => {
          const newValue = Object.entries(getValueAtPath(path, model) || [])
          const delta = compareKeyedLists(key, oldValue, newValue)

          if (delta) {
            updateList(node, delta, newValue, createListItem)
          }
          oldValue = newValue.slice(0)
        },
        pickupNode,
      }
    },
  }

  const mediator = () => {
    const o = observer()
    return {
      bind(v) {
        let s = createSubscription[v.type](v)
        o.subscribe(s.handler)
        return s
      },
      scheduleUpdate: debounce((cb) => {
        return o.publish(cb)
      }),
      update(cb) {
        return o.publish(cb)
      },
    }
  }

  const { bind, update, scheduleUpdate } = mediator()

  let blockCount = 0
  let c = 0

  const parse = (frag) => {
    let index = 0
    let map = {}

    walk(frag, (node) => {
      let x = []
      let pickupNode
      switch (node.nodeType) {
        case node.TEXT_NODE: {
          let value = node.textContent
          if (hasMustache(value)) {
            x.push({
              type: TEXT,
              value,
            })
          }
          break
        }
        case node.ELEMENT_NODE: {
          let each = parseEach(node)

          if (each) {
            let ns = node.namespaceURI
            let m

            if (ns.endsWith("/svg")) {
              node.removeAttribute("each")
              let tpl = document.createElementNS(ns, "defs")
              tpl.innerHTML = node.outerHTML
              node.parentNode.replaceChild(tpl, node)
              node = tpl
              m = parse(node.firstChild)
            } else {
              if (node.nodeName !== "TEMPLATE") {
                node.removeAttribute("each")
                let tpl = document.createElement("template")

                tpl.innerHTML = node.outerHTML
                node.parentNode.replaceChild(tpl, node)
                node = tpl
              }
              m = parse(node.content.firstChild)
            }

            pickupNode = node.nextSibling

            x.push({
              type: REPEAT,
              map: m,
              blockIndex: blockCount++,
              ...each,
              pickupNode,
            })

            break
          }

          let attrs = node.attributes
          let i = attrs.length
          while (i--) {
            let { name, value } = attrs[i]

            if (
              name === ":name" &&
              value &&
              (node.nodeName === "INPUT" ||
                node.nodeName === "SELECT" ||
                node.nodeName === "TEXTAREA")
            ) {
              x.push({
                type: INPUT,
                path: value,
              })
            }

            if (name.startsWith(":on")) {
              node.removeAttribute(name)
              let eventType = name.split(":on")[1]
              x.push({
                type: EVENT,
                eventType,
                ...parseEventHandler(value),
              })
            } else if (name.startsWith(":")) {
              let prop = name.slice(1)

              x.push({
                type: ATTRIBUTE,
                name: prop,
                value: value || `{{${prop}}}`,
              })
              node.removeAttribute(name)
            }
          }
        }
      }
      if (x.length) map[index] = x
      index++
      return pickupNode
    })

    return map
  }

  const multi =
    (...fns) =>
    (...args) => {
      for (let fn of fns) {
        let v = fn(...args)
        if (v === false) return false
      }
    }

  const bindAll = (model, bMap, hydrate) => {
    let index = 0
    return (node) => {
      let k = index
      let p
      if (k in bMap) {
        bMap[k].forEach((v) => {
          let x = bind({
            ...v,
            node,
            model,
            hydrate,
          })
          p = x.pickupNode
        })
        node.$i = index
      }
      index++
      return p
    }
  }

  let prevState = Object.assign({}, model)
  let p = proxy(model, () =>
    scheduleUpdate(() => {
      updatedCallback?.()
      p.updatedCallback?.(prevState)
      prevState = Object.assign({}, model)
    })
  )
  let frag = fragmentFromTemplate(template)
  let map = parse(frag)
  let hydrate = target.hasAttribute?.(HYDRATE_ATTR)
  if (hydrate) {
    walk(target, bindAll(p, map, 1))
  } else {
    walk(frag, bindAll(p, map))
    beforeMountCallback?.(frag)
    target.appendChild(frag)
    update()
    target.setAttribute?.(HYDRATE_ATTR, 1)
  }

  return p
}
