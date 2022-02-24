import { define } from "../src/index.js"

describe("nesting", () => {
  it("should...", () => {
    let n1 = createName()
    let n2 = createName()

    define(
      n1,
      () => {
        return {}
      },
      `<li><slot></slot></li>`
    )

    define(
      n2,
      ({ items = [] }) => {
        return { items }
      },
      `<ul>
        <template each="item in items">
            <${n1}>{{ item }}</${n1}>
        </template>
      </ul>`
    )

    mount(html`<${n2}></${n2}>`)

    $(n2).items = [1, 2, 3]
  })
})
