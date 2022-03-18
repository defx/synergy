import { applyAttribute } from "../src/helpers.js"

describe("applyAttribute", () => {
  it("sets boolean true as empty string", () => {
    let node = document.createElement("div")

    applyAttribute(node, "foo", true)

    assert.equal(node.getAttribute("foo"), "")
  })
  it("removes attribute when boolean false", () => {
    let node = document.createElement("div")

    applyAttribute(node, "foo", false)

    assert.equal(node.getAttribute("foo"), null)
  })
  it("sets aria- prefixed attributes with boolean false to string", () => {
    let node = document.createElement("div")

    applyAttribute(node, "ariaFoo", false)

    assert.equal(node.getAttribute("aria-foo"), "false")
  })
  it("sets aria- prefixed attributes with boolean true to string", () => {
    let node = document.createElement("div")

    applyAttribute(node, "ariaFoo", true)

    assert.equal(node.getAttribute("aria-foo"), "true")
  })
  it("sets non-aria attribute with falsy value to string", () => {
    let node = document.createElement("div")

    applyAttribute(node, "dataIndex", 0)

    assert.equal(node.getAttribute("data-index"), "0")
  })
})
