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

  it("afterNextRender allows for things like focusing a newly rendered input", () => {
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

  it("enables async middleware composition", async () => {
    let name = createName()

    function wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }

    function authenticate(action, next, { dispatch }) {
      // check if we're logged in, authenticate if not
      wait(1)
        .then(() => dispatch({ type: "setUser", payload: { name: "matt" } }))
        .then(() => next(action))
    }

    define(
      name,
      () => {
        return {
          state: {
            comments: [],
          },
          update: {
            setUser: (state, action) => ({
              ...state,
              user: action.payload,
            }),
            makeComment: (state, action) => {
              return {
                ...state,
                comments: state.comments.concat(action.payload),
              }
            },
          },
          middleware: {
            makeComment: [
              authenticate,
              (_, next, { getState }) => {
                const {
                  user: { name },
                  comment,
                } = getState()

                next({
                  type: "makeComment",
                  payload: {
                    name,
                    comment,
                    createdAt: Date.now(),
                  },
                })
              },
            ],
          },
        }
      },
      `<div :each="comments" class="comment"><h3>Posted by {{ name }}</h3><p>{{ comment }}</p></div><textarea :name="comment"></textarea><button type="button" :onclick="makeComment">submit</button>`
    )
    mount(`<${name}></${name}>`)

    const textarea = $(name).querySelector("textarea")

    textarea.value = "foo"
    textarea.dispatchEvent(new KeyboardEvent("input", { bubbles: true }))
    await nextFrame()

    $(name).querySelector("button").click()

    await wait(50)

    const comments = $(name).querySelectorAll(".comment")

    assert.equal(comments.length, 1)
    assert.equal(comments[0].querySelector("h3").textContent, "Posted by matt")
    assert.equal(comments[0].querySelector("p").textContent, "foo")
  })
})
