import { appendStyles } from "./css.js"

export const partials = {}

export const partial = (name, html, css) => {
  if (css) appendStyles(name, css)
  partials[name.toUpperCase()] = html
}
