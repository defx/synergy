import { getValueAtPath } from "./helpers.js"

const VALUE = 1
const KEY = 2
const FUNCTION = 3

export const hasMustache = (v) => v.match(/({{[^{}]+}})/)

export const parseEventHandler = (value) => {
  let m = value.match(/(?:(\w+) => )?([^\(]+)(?:\(([^\)]*)\))/)

  if (!m) return

  let event = m[1],
    method = m[2],
    args = m[3] ? m[3].split(",").map((v) => v.trim()) : []

  return {
    event,
    method,
    args,
  }
}

export const getParts = (value, context) =>
  value
    .trim()
    .split(/({{[^{}]+}})/)
    .filter((v) => v)
    .map((value) => {
      let match = value.match(/{{([^{}]+)}}/)

      if (!match)
        return {
          type: VALUE,
          value,
          negated: false,
        }

      value = match[1].trim()
      let negated = value.charAt(0) === "!"
      if (negated) value = value.slice(1)

      let fn = parseEventHandler(value, context)

      return fn
        ? {
            type: FUNCTION,
            negated,
            ...fn,
          }
        : {
            type: KEY,
            value,
            negated,
          }
    })

export const getValueFromParts = (target, parts) => {
  return parts.reduce((a, part) => {
    let { type, value, negated } = part

    let v

    if (type === VALUE) v = value
    if (type === KEY) {
      v = getValueAtPath(value, target)
    }
    if (type === FUNCTION) {
      let args = part.args.map((value) => getValueAtPath(value, target))

      v = getValueAtPath(part.method, target)?.(...args)
    }

    if (negated) v = !v

    return a || a === 0 ? a + v : v
  }, "")
}
