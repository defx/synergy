import { getValueAtPath } from "./helpers.js"

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

    if (x[i]?.hasOwnProperty?.(property)) return x[i][property]

    return Reflect.get(...arguments)
  },
  set(target, property, value) {
    let x = getValueAtPath(path, target)

    if (x[i]?.hasOwnProperty?.(property)) {
      return (x[i][property] = value)
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
