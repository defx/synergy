import { define } from "../src/index.js"

describe("hydrate", () => {
  it("rehydrates event listeners", () => {
    let name = createName()
    let stack = []

    define(
      name,
      () => ({
        foo() {
          stack.push("foo!")
        },
      }),
      html`
        <div>
          <a href="#" id="foo" :onclick="foo()"><slot></slot></a>
        </div>
      `
    )

    mount(html`<${name}>click me!</${name}>`)

    let node = $(name)
    let outerHTML = node.outerHTML

    node.remove()

    mount(outerHTML)

    $("#foo").click()

    assert.deepEqual(stack, ["foo!"])
  })
  it("rehydrates repeated blocks", async () => {
    let name = createName()

    define(
      name,
      () => {
        return {
          $todos: [
            {
              title: "feed the duck",
            },
            {
              title: "walk the cat",
            },
          ],
          click(todo) {
            console.log(todo.title)
          },
        }
      },
      `
      <ul>
        <li each="todo in $todos" :onclick="click(todo)">{{ title }}</li>
      </ul>
    `
    )

    mount(`<${name}></${name}>`)

    let html = $(name).outerHTML

    $(name).remove()

    mount(html)
  })
})
