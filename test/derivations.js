import { define } from "../src/index.js"

describe("derivations", () => {
  it("derives the values", () => {
    let name = createName()

    let initialState = {
      todos: [
        {
          title: "feed the dog",
          completed: false,
        },
        {
          title: "walk the cat",
          completed: true,
        },
        {
          title: "eat the food",
          completed: true,
        },
      ],
    }

    define(
      name,
      () => ({
        update: (state = initialState, action) => {
          switch (action.type) {
            default: {
              return {
                ...state,
              }
            }
          }
        },
        derivations: {
          numCompleted: ({ todos }) =>
            todos.filter(({ completed }) => completed).length,
        },
      }),
      `<p>{{ numCompleted }}</p>`
    )

    mount(`<${name}></${name}>`)

    assert.equal($(`p`).innerText, 2)
  })
})
