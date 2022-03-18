import { define } from "../src/index.js"

describe("hydrate", () => {
  it("rehydrates event listeners", () => {
    let name = createName()
    let stack = []

    define(
      name,
      () => ({
        update: (state, action) => {
          switch (action.type) {
            case "foo": {
              stack.push("foo!")
            }
          }
          return state
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

    $("#foo").click()

    assert.deepEqual(stack, ["foo!"])
  })
  it("rehydrates repeated blocks", async () => {
    let name = createName()
    let stack = []
    let initialState = {
      $todos: [
        {
          title: "feed the duck",
        },
        {
          title: "walk the cat",
        },
      ],
    }

    define(
      name,
      () => ({
        update: (state = initialState, action) => {
          switch (action.type) {
            case "click": {
              stack.push(action.context.todo.title)
            }
          }
          return state
        },
      }),
      `
      <ul>
        <li each="todo in $todos" :onclick="click">{{ title }}</li>
      </ul>
    `
    )

    mount(`<${name}></${name}>`)

    let html = $(name).outerHTML

    $(name).remove()

    mount(html)

    $(name).todos = $(name).todos.concat({
      title: "eat the frog",
    })

    await nextFrame()

    $("li:nth-of-type(3)").click()

    assert.deepEqual(stack, ["eat the frog"])
  })

  it("rehydrates from the last state", async () => {
    let name = createName()
    let stack = []

    let initialState = {
      $todos: [
        {
          title: "feed the duck",
        },
        {
          title: "walk the cat",
        },
      ],
    }

    define(
      name,
      () => ({
        update: (state = initialState, action) => {
          switch (action.type) {
            case "click": {
              stack.push(action.context.todo.title)
            }
          }
          return state
        },
      }),
      `
      <ul>
        <li each="todo in $todos" :onclick="click">{{ title }}</li>
      </ul>
    `
    )

    mount(`<${name}></${name}>`)

    $(name).todos = $(name).todos.concat({
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
