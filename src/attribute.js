import { isPrimitive, typeOf } from "./helpers.js"

const pascalToKebab = (string) =>
  string.replace(/[\w]([A-Z])/g, function (m) {
    return m[0] + "-" + m[1].toLowerCase()
  })

const kebabToPascal = (string) =>
  string.replace(/[\w]-([\w])/g, function (m) {
    return m[0] + m[2].toUpperCase()
  })

const parseStyles = (value) => {
  let type = typeof value

  if (type === "string")
    return value.split(";").reduce((o, value) => {
      const [k, v] = value.split(":").map((v) => v.trim())
      if (k) o[k] = v
      return o
    }, {})

  if (type === "object") return value

  return {}
}

const joinStyles = (value) =>
  Object.entries(value)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ")

const convertStyles = (o) =>
  Object.keys(o).reduce((a, k) => {
    a[pascalToKebab(k)] = o[k]
    return a
  }, {})

export const applyAttribute = (node, name, value) => {
  if (name === "style") {
    value = joinStyles(
      convertStyles({
        ...parseStyles(node.getAttribute("style")),
        ...parseStyles(value),
      })
    )
  } else if (name === "class") {
    switch (typeOf(value)) {
      case "Array":
        value = value.join(" ")
        break
      case "Object":
        value = Object.keys(value)
          .reduce((a, k) => {
            if (value[k]) a.push(k)
            return a
          }, [])
          .join(" ")
        break
    }
  } else if (!isPrimitive(value)) {
    return (node[kebabToPascal(name)] = value)
  }

  name = pascalToKebab(name)

  if (typeof value === "boolean") {
    if (name.startsWith("aria-")) {
      value = "" + value
    } else if (value) {
      value = ""
    }
  }

  let current = node.getAttribute(name)

  if (value === current) return

  if (typeof value === "string" || typeof value === "number") {
    node.setAttribute(name, value)
  } else {
    node.removeAttribute(name)
  }
}
