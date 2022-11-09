import {
  TEXT,
  ATTRIBUTE,
  INPUT,
  EVENT,
  REPEAT,
  CONDITIONAL,
} from "./constants.js"
import { updateFormControl } from "./formControl.js"
import {
  debounce,
  fragmentFromTemplate,
  getValueAtPath,
  setValueAtPath,
  last,
  walk,
  wrapToken,
  getDataScript,
} from "./helpers.js"
import { compareKeyedLists, getBlocks, parseEach, updateList } from "./list.js"
import { getParts, getValueFromParts, hasMustache } from "./token.js"
import { applyAttribute } from "./attribute.js"
import { createContext } from "./context.js"
import { convertToTemplate } from "./template.js"
import { partials } from "./partial.js"

export const render = (
  target,
  { getState, dispatch, refs },
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
    [TEXT]: ({ value, node, context }, { getState }) => {
      return {
        handler: () => {
          let state = context ? context.wrap(getState()) : getState()
          let a = node.textContent
          let b = getValueFromParts(state, getParts(value))

          if (a !== b) node.textContent = b
        },
      }
    },
    [ATTRIBUTE]: ({ value, node, name, context }, { getState }) => {
      return {
        handler: () => {
          let state = context ? context.wrap(getState()) : getState()
          let b = getValueFromParts(state, getParts(value))

          applyAttribute(node, name, b)

          if (node.nodeName === "OPTION") {
            let path = node.parentNode.getAttribute("name")
            let selected = getValueAtPath(path, state)
            node.selected = selected === b
          }
        },
      }
    },
    [INPUT]: ({ node, path, context }, { getState, dispatch }) => {
      let eventType = ["radio", "checkbox"].includes(node.type)
        ? "click"
        : "input"

      node.addEventListener(eventType, () => {
        let value =
          node.getAttribute("type") === "checkbox" ? node.checked : node.value

        if (value.trim?.().length && !isNaN(value)) value = +value

        if (context) {
          let state = context.wrap(getState())
          setValueAtPath(path, value, state)
          dispatch({
            type: "MERGE",
            payload: state,
          })
        } else {
          dispatch({
            type: "SET",
            payload: {
              name: path,
              value,
              context,
            },
          })
        }
      })

      return {
        handler: () => {
          let state = context ? context.wrap(getState()) : getState()
          updateFormControl(node, getValueAtPath(path, state))
        },
      }
    },
    [EVENT]: (
      { node, eventType, actionType, context },
      { dispatch, getState }
    ) => {
      node.addEventListener(eventType, (event) => {
        let action = {
          type: actionType,
          event,
          scope: context ? context.wrap(getState()) : getState(),
        }

        dispatch(action)
      })
      return {
        handler: () => {},
      }
    },
    [CONDITIONAL]: ({ node, expression, context, map }, { getState }) => {
      return {
        handler: () => {
          let state = context ? context.wrap(getState()) : getState()
          let shouldMount = getValueFromParts(
            state,
            getParts(wrapToken(expression))
          )
          let isMounted = node.dataset.mounted === "1"

          if (shouldMount && !isMounted) {
            // MOUNT
            let frag = fragmentFromTemplate(node)
            walk(frag.firstChild, bindAll(map, null, context))
            node.after(frag)
            node.dataset.mounted = "1"
          } else if (!shouldMount && isMounted) {
            // UNMOUNT
            node.nextSibling.remove()
            delete node.dataset.mounted
          }
        },
        // pickupNode,
      }
    },
    [REPEAT]: (
      { node, context, map, path, identifier, index, key, blockIndex, hydrate },
      { getState }
    ) => {
      let oldValue
      node.$t = blockIndex - 1

      let pickupNode = node.nextSibling

      const initialiseBlock = (rootNode, i, k, exitNode) => {
        walk(
          rootNode,
          multi(
            (node) => {
              if (node === exitNode) return false
            },
            bindAll(
              map,
              hydrate,
              createContext(
                (context?.get() || []).concat({
                  path,
                  identifier,
                  key,
                  index,
                  i,
                  k,
                })
              )
            ),
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
        let x = getValueAtPath(path, getState())
        let blocks = getBlocks(node)

        blocks.forEach((block, i) => {
          let datum = x[i]
          let k = datum?.[key]
          initialiseBlock(block[0], i, k, last(block).nextSibling)
        })

        pickupNode = last(last(blocks))?.nextSibling
      }

      return {
        handler: () => {
          let state = context ? context.wrap(getState()) : getState()

          const newValue = Object.entries(getValueAtPath(path, state) || [])
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
        let s = createSubscription[v.type](v, { getState, dispatch })

        o.subscribe(s.handler)
        return s
      },

      update(cb) {
        return o.publish(cb)
      },
    }
  }

  const { bind, update } = mediator()

  let blockCount = 0

  function compareAttributes(a, b) {
    if (b.name === ":if") {
      return -1
    }
    if (a.name === ":if") {
      return 1
    }
    return 0
  }

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
              value: value.trim(),
            })
          }
          break
        }
        case node.ELEMENT_NODE: {
          if (node.nodeName in partials) {
            node.innerHTML = partials[node.nodeName]
            break
          }

          let each = parseEach(node)

          if (each) {
            let ns = node.namespaceURI
            let m

            node.removeAttribute(":each")
            node = convertToTemplate(node)

            if (ns.endsWith("/svg")) {
              m = parse(node.firstChild)
            } else {
              m = parse(node.content.firstChild)
            }

            pickupNode = node.nextSibling

            x.push({
              type: REPEAT,
              map: m,
              blockIndex: blockCount++,
              ...each,
            })

            break
          }

          let attrs = [...node.attributes].sort(compareAttributes)
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

              node.removeAttribute(name)
              node.setAttribute("name", value)
            } else if (name === ":if") {
              node.removeAttribute(name)
              node = convertToTemplate(node)
              pickupNode = node.nextSibling

              x.push({
                type: CONDITIONAL,
                expression: value,
                map: parse(node.content?.firstChild || node.firstChild),
              })
            } else if (name === ":ref") {
              node.removeAttribute(name)
              node.setAttribute("ref", value)
              Object.defineProperty(refs, value, {
                get() {
                  return document.querySelector(`[ref="${value}"]`)
                },
              })
            } else if (name.startsWith(":on")) {
              node.removeAttribute(name)
              let eventType = name.split(":on")[1]
              x.push({
                type: EVENT,
                eventType,
                actionType: value,
              })
            } else if (name.startsWith(":")) {
              let prop = name.slice(1)

              let v = value || prop

              if (!v.includes("{{")) v = `{{${v}}}`

              x.push({
                type: ATTRIBUTE,
                name: prop,
                value: v,
              })
              node.removeAttribute(name)
            }
          }
        }
      }
      if (x.length) {
        map[index] = x
      }
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

  const bindAll = (bMap, hydrate = 0, context) => {
    let index = 0
    return (node) => {
      let k = index
      let p

      if (k in bMap) {
        bMap[k].forEach((v) => {
          let x = bind({
            ...v,
            node,
            context,
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

  let frag = fragmentFromTemplate(template)
  let map = parse(frag)
  let ds = getDataScript(target)

  if (ds) {
    walk(target, bindAll(map, 1))
  } else {
    walk(frag, bindAll(map))
    beforeMountCallback?.(frag)
    update()
    target.prepend(frag)
  }

  return debounce(() => update(updatedCallback))
}
