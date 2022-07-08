import { define } from "../synergy.js"
import { html } from "../utils.js"

import "./myCounter.js"

define(
  "my-app",
  () => {
    return {}
  },
  html`
    <my-counter></my-counter>
    <my-counter></my-counter>
  `
)
