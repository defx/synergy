import { define } from "../synergy.js"
import { html } from "../utils.js"

import "./myHeader.js"
import "./myFooter.js"

define(
  "my-app",
  () => {
    return {
      title: "First & Foremost",
    }
  },
  html`
    <my-header></my-header>
    <my-footer></my-footer>
  `
)
