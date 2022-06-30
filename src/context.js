import { getValueAtPath, isPrimitive } from "./helpers.js"

const handler = ({ path, identifier, key, index, i, k }) => ({
  get(target, property) {
    let x = getValueAtPath(path, target)

    // x === the collection

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

    let t = key ? x.find((v) => v[key] === k) : x?.[i]
    if (t?.hasOwnProperty?.(property)) return t[property]

    return Reflect.get(...arguments)
  },
  set(target, property, value) {
    let x = getValueAtPath(path, target)
    let t = key ? x.find((v) => v[key] === k) : x[i]
    if (t && !isPrimitive(t)) {
      t[property] = value
      return true
    }

    return Reflect.set(...arguments)
  },
})

export const createContext = (v = []) => {
  let context = v
  return {
    get: () => context,
    push: (v) => context.push(v),
    wrap: (state) => {
      return context.reduce(
        (target, ctx) => new Proxy(target, handler(ctx)),
        state
      )
    },
  }
}
