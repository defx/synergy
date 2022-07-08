import { appendStyles } from "./css.js"

export const partials = {}

export const partial = (name, html, css) => {
  if (css) appendStyles(css)
  partials[name.toUpperCase()] = html
}
