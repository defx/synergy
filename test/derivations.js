import { define } from "../src/index.js"

describe("derive", () => {
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
        initialState,
        derive: {
          numCompleted: ({ todos }) =>
            todos.filter(({ completed }) => completed).length,
        },
      }),
      `<p>{{ numCompleted }}</p>`
    )

    mount(`<${name}></${name}>`)

    assert.equal($(`p`).innerText, 2)
  })

  it("should support same name decorations", () => {
    let name = createName()

    define(
      name,
      () => ({
        initialState: {
          items: [{ id: 1 }, { id: 2 }, { id: 3 }],
        },
        derive: {
          items: ({ items }) =>
            items.map((item, i) => ({
              ...item,
              isSecond: i === 1 ? "page" : null,
            })),
        },
      }),
      html`
        <ul>
          <li each="item in items">
            <a :aria-current="isSecond">{{ id }}</a>
          </li>
        </ul>
      `
    )

    mount(html`<${name}></${name}>`)

    assert.equal($$('a[aria-current="page"]').length, 1)
  })
})
