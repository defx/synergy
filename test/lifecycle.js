describe("lifecycle", () => {
  it("should fire after update", async () => {
    mount(html` <div id="container"></div> `)

    let stack = []

    let name = createName()

    synergy.define(
      name,
      () => {
        return {
          $message: "hi!",
          updatedCallback() {
            stack.push(true)
          },
        }
      },
      html`<p>{{ $message }}</p>`
    )

    mount(html`<${name}></${name}>`)

    assert.equal(stack.length, 0)

    $(name).message = "bye!"

    await nextFrame()

    assert.equal(stack.length, 1)
  })
  it("should provide previous state", async () => {
    let stack = []

    let name = createName()

    synergy.define(
      name,
      () => {
        return {
          $message: "",
          updatedCallback(prevState) {
            stack.push(prevState.$message)
          },
        }
      },
      html`<p>{{ $message }}</p>`
    )

    mount(html`<${name} message="hi!"></${name}>`)

    assert.equal(stack.length, 0)

    $(name).message = "bye!"

    await nextFrame()

    assert.equal(stack.length, 1)

    assert.equal(stack[0], "hi!")
  })
  it("should have correct thisArg", async () => {
    let name = createName()

    let stack = []

    synergy.define(
      name,
      () => {
        return {
          $message: "hi!",
          updatedCallback(prevState) {
            stack.push({
              prev: prevState.$message,
              next: this.$message,
            })
          },
        }
      },
      html`<p>{{ $message }}</p>`
    )

    mount(html`<${name}></${name}>`)

    assert.equal(stack.length, 0)

    $(name).message = "bye!"

    await nextFrame()

    assert.equal(stack.length, 1)

    assert.deepEqual(stack[0], {
      prev: "hi!",
      next: "bye!",
    })
  })
})
