import { html } from "../utils.js"

function list(items) {
  return html`
    <ul>
      ${items.map((item) => {
        const { title, items, href } = item

        if (title && items) return html`<li>${title} ${list(items)}</li>`

        if (title && href)
          return html`<li>
            <a href="${href}">${title}</a>
          </li>`

        return null
      })}
    </ul>
  `
}

export function navTemplate(items = []) {
  return html` <nav id="mainNavigation">${list(items)}</nav> `
}
