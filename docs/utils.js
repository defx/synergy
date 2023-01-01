function _(value) {
  if (typeof value === "undefined") return ""
  return String(Array.isArray(value) ? value.join("") : value)
}

function identity(template, ...args) {
  let str = ""
  for (let i = 0; i < args.length; i++) {
    str += template[i] + _(args[i])
  }
  return str + template[template.length - 1]
}

export const html = identity
export const css = identity
export const gql = identity
