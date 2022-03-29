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
        middleware: [
          {
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
        ],
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

  it("afterNextRender allows for things like focusing a newly rendered input", () => {
    let name = createName()
    let initialState = {
      hidden: true,
    }
    define(
      name,
      () => ({
        update: (state = initialState, action) => {
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
        middleware: [
          (action, next, { getState, afterNextRender }) => {
            switch (action.type) {
              case "toggle": {
                if (getState().hidden) {
                  afterNextRender(() => $("input").focus())
                }
                break
              }
            }
            return next(action)
          },
        ],
      }),
      `<button :onclick="toggle">toggle</button><input :hidden>`
    )
    mount(`<${name}></${name}>`)
  })

  it("allows one middleware function to pass action to next", () => {
    let name = createName()
    let stack = []
    define(
      name,
      () => ({
        update: {
          fire: (state, action) => {
            stack.push(action)
            return state
          },
        },
        middleware: [
          {
            fire: (action, next) => {
              next({ ...action, foo: "bar" })
            },
          },
          {
            fire: (action, next) => {
              next({ ...action, moo: "baa" })
            },
          },
        ],
      }),
      `<button :onclick="fire">fire!</button>`
    )
    mount(`<${name}></${name}>`)
    $(`button`).click()
    assert.equal(stack.length, 1)
    assert.equal(stack[0].type, "fire")
    assert.equal(stack[0].foo, "bar")
    assert.equal(stack[0].moo, "baa")
  })
})
