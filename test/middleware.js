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
        update: {
          saveEdit: (state, action) => {
            stack.push(action)
            return state
          },
          cancelEdit: (state, action) => {
            stack.push(action)
            return state
          },
        },
        middleware: {
          keydown: (action, next) => {
            let { keyCode } = action.event
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
          },
        },
      }),
      `<button :onkeydown="keydown">hi!</button>`
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

  it("allows promise chaining after the next update following an action", () => {
    let name = createName()
    let state = {
      hidden: true,
    }
    define(
      name,
      () => ({
        update: (state = state, action) => {
          switch (action.type) {
            case "toggle": {
              return {
                ...state,
                hidden: !state.hidden,
              }
            }
            default:
              return state
          }
        },
        middleware: {
          toggle: (action, next) => {
            next(action).then(() => $("input").focus())
          },
        },
      }),
      `<button :onclick="toggle">toggle</button><input :hidden>`
    )
    mount(`<${name}></${name}>`)
  })
})
