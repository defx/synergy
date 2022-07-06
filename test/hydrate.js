import { define } from "../src/index.js"

describe("hydrate", () => {
  it("rehydrates event listeners", async () => {
    let name = createName()
    let stack = []

    define(
      name,
      () => ({
        update: {
          foo: () => stack.push("foo!"),
        },
      }),
      html`
        <div>
          <a href="#" id="foo" :onclick="foo"><slot></slot></a>
        </div>
      `
    )

    mount(html`<${name}>click me!</${name}>`)

    let node = $(name)
    let outerHTML = node.outerHTML

    node.remove()

    mount(outerHTML)

    assert.deepEqual(stack, [])

    $("#foo").click()

    assert.deepEqual(stack, ["foo!"])
  })
  it("rehydrates repeated blocks", async () => {
    let name = createName()
    let stack = []

    define(
      name,
      () => {
        return {
          initialState: {
            $todos: [
              {
                title: "feed the duck",
              },
              {
                title: "walk the cat",
              },
            ],
          },
          update: {
            click: (state, action) => {
              stack.push(action.context.todo.title)
              return state
            },
          },
        }
      },
      `
      <ul>
        <li :each="todo in $todos" :onclick="click">{{ title }}</li>
      </ul>
    `
    )

    mount(`<${name}></${name}>`)

    let html = $(name).outerHTML

    $(name).remove()

    mount(html)

    const { todos } = $(name)

    $(name).todos = todos.concat({
      title: "eat the frog",
    })

    // $(name).todos.push({
    //   title: "eat the frog",
    // })

    await nextFrame()

    $$(`li`)[2].click()

    assert.deepEqual(stack, ["eat the frog"])
  })

  it("rehydrates from the last state", async () => {
    let name = createName()
    let stack = []

    define(
      name,
      () => {
        return {
          initialState: {
            $todos: [
              {
                title: "feed the duck",
              },
              {
                title: "walk the cat",
              },
            ],
          },
          update: {
            click: (state, { context: { todo } }) => {
              stack.push(todo.title)
              return state
            },
          },
        }
      },
      `
      <ul>
        <li :each="todo in $todos" :onclick="click">{{ title }}</li>
      </ul>
    `
    )

    mount(`<${name}></${name}>`)

    const { todos } = $(name)

    $(name).todos = todos.concat({
      title: "eat the frog",
    })

    await nextFrame()

    let html = $(name).outerHTML

    $(name).remove()

    mount(html)

    await nextFrame()

    $("li:nth-of-type(3)").click()

    assert.deepEqual(stack, ["eat the frog"])
  })
})
