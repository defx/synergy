export const last = (v = []) => v[v.length - 1]

export const isWhitespace = (node) => {
  return node.nodeType === node.TEXT_NODE && node.nodeValue.trim() === ""
}

export const walk = (node, callback, deep = true) => {
  if (!node) return
  if (!isWhitespace(node)) {
    let v = callback(node)
    if (v === false) return
    if (v?.nodeName) return walk(v, callback, deep)
  }
  if (deep) walk(node.firstChild, callback, deep)
  walk(node.nextSibling, callback, deep)
}

const transformBrackets = (str = "") => {
  let parts = str.split(/(\[[^\]]+\])/).filter((v) => v)
  return parts.reduce((a, part) => {
    let v = part.charAt(0) === "[" ? "." + part.replace(/\./g, ":") : part
    return a + v
  }, "")
}

export const realPath = (path, target) => {
  let parts = transformBrackets(path)
    .split(".")
    .map((k) => {
      if (k.charAt(0) === "[") {
        let p = k.slice(1, -1).replace(/:/g, ".")
        return getValueAtPath(p, target)
      } else {
        return k
      }
    })

  return parts.join(".")
}

const getTarget = (path, target) => {
  let parts = transformBrackets(path)
    .split(".")
    .map((k) => {
      if (k.charAt(0) === "[") {
        let p = k.slice(1, -1).replace(/:/g, ".")
        return getValueAtPath(p, target)
      } else {
        return k
      }
    })

  let t =
    parts.slice(0, -1).reduce((o, k) => {
      return o && o[k]
    }, target) || target
  return [t, last(parts)]
}

export const getValueAtPath = (path, target) => {
  let [a, b] = getTarget(path, target)
  let v = a?.[b]
  if (typeof v === "function") return v.bind(a)
  return v
}

export const setValueAtPath = (path, value, target) => {
  let [a, b] = getTarget(path, target)
  return (a[b] = value)
}

export const fragmentFromTemplate = (v) => {
  if (typeof v === "string") {
    let tpl = document.createElement("template")
    tpl.innerHTML = v.trim()
    return tpl.content
  }
  if (v.nodeName === "TEMPLATE") return v.cloneNode(true).content
  if (v.nodeName === "defs") return v.firstElementChild.cloneNode(true)
}

/*

this version of debounce will call the function immediately on first invocation within a single frame. any subsequent invocations within the same frame will be dropped.

@todo: trailing -> leading

*/

// export const debounce = (fn) => {
//   let t
//   return function (...args) {
//     if (t) return
//     t = requestAnimationFrame(() => {
//       fn(...args)
//       t = null
//     })
//   }
// }

export const debounce = (fn) => {
  let wait = false
  let invoke = false
  return () => {
    if (wait) {
      invoke = true
    } else {
      wait = true
      fn()
      requestAnimationFrame(() => {
        if (invoke) fn()
        wait = false
      })
    }
  }
}

export const isPrimitive = (v) => v === null || typeof v !== "object"

export const typeOf = (v) =>
  Object.prototype.toString.call(v).match(/\s(.+[^\]])/)[1]

export const pascalToKebab = (string) =>
  string.replace(/[\w]([A-Z])/g, function (m) {
    return m[0] + "-" + m[1].toLowerCase()
  })

export const kebabToPascal = (string) =>
  string.replace(/[\w]-([\w])/g, function (m) {
    return m[0] + m[2].toUpperCase()
  })

export const applyAttribute = (node, name, value) => {
  name = pascalToKebab(name)

  if (typeof value === "boolean") {
    if (name.startsWith("aria-")) {
      value = "" + value
    } else if (value) {
      value = ""
    }
  }

  if (typeof value === "string" || typeof value === "number") {
    node.setAttribute(name, value)
  } else {
    node.removeAttribute(name)
  }
}

export const attributeToProp = (k, v) => {
  let name = kebabToPascal(k)
  if (v === "") v = true
  if (k.startsWith("aria-")) {
    if (v === "true") v = true
    if (v === "false") v = false
  }
  return {
    name,
    value: v,
  }
}
