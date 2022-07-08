import { define, partial } from "../src/index.js"

describe("partial", () => {
  it("is included within parent template", () => {
    let partialName = createName()

    partial(partialName, html`<p>{{ foo }}</p>`)

    let name = createName()

    define(
      name,
      () => ({
        observe: ["foo"],
        state: {
          foo: "bar",
        },
      }),
      html`<section><${partialName} /></section>`
    )

    mount(`<${name}></${name}>`)

    assert.equal($(`${partialName} p`).textContent, "bar")

    $(name).foo = "baz"

    assert.equal($(`${partialName} p`).textContent, "baz")
  })
})
