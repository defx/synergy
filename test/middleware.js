import { define } from "../src/index.js"

describe("middleware", () => {
  it("enables actions to be modified", () => {
    const KEYS = {
      RETURN: 13,
      ESCAPE: 27,
    }
    let name = createName()
    let stack = []
    define(
      name,
      () => ({
        update: (_, action) => {
          switch (action.type) {
            case "saveEdit": {
              stack.push(action)
              break
            }
            case "cancelEdit": {
              stack.push(action)
              break
            }
          }
        },
      }),
      `<button :onkeydown="keydown">hi!</button>`,
      {
        middleware: [
          (action, next) => {
            switch (action.type) {
              case "keydown": {
                const { keyCode } = action.event
                switch (keyCode) {
                  case KEYS.ESCAPE: {
                    next({ ...action, type: "cancelEdit" })
                    break
                  }
                  case KEYS.RETURN: {
                    next({ ...action, type: "saveEdit" })
                    break
                  }
                }
              }
            }
          },
        ],
      }
    )

    mount(html`<${name}></${name}>`)

    $(`button`).dispatchEvent(
      new KeyboardEvent("keydown", {
        keyCode: KEYS.RETURN,
        bubbles: true,
      })
    )

    $(`button`).dispatchEvent(
      new KeyboardEvent("keydown", {
        keyCode: KEYS.ESCAPE,
        bubbles: true,
      })
    )

    assert.equal(stack.length, 2)
    assert.equal(stack[0].type, "saveEdit")
    assert.equal(stack[1].type, "cancelEdit")
  })
})
