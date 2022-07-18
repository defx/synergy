import { partial } from "../synergy.js"
import { html, css } from "../utils.js"

partial(
  "my-header",
  html`
    <header>
      <a href="/">{{ title }}</a>
    </header>
  `,
  css`
    header {
      background-color: gold;
    }
    a {
      color: tomato;
    }
  `
)
