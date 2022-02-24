import { applyAttribute } from "../src/helpers.js"

describe("applyAttribute", () => {
  it("", () => {
    let node = document.createElement("div")

    applyAttribute(node, "foo", true)

    assert.equal(node.getAttribute("foo"), "")
  })
  it("", () => {
    let node = document.createElement("div")

    applyAttribute(node, "foo", false)

    assert.equal(node.getAttribute("foo"), null)
  })
  it("", () => {
    let node = document.createElement("div")

    applyAttribute(node, "ariaFoo", false)

    assert.equal(node.getAttribute("aria-foo"), "false")
  })
  it("", () => {
    let node = document.createElement("div")

    applyAttribute(node, "ariaFoo", true)

    assert.equal(node.getAttribute("aria-foo"), "true")
  })
  it("", () => {
    let node = document.createElement("div")

    applyAttribute(node, "dataIndex", 0)

    assert.equal(node.getAttribute("data-index"), "0")
  })
})
