import { define } from "../src/index.js"

describe("iterations", () => {
  it("should iterate over Array", () => {
    let name = createName()

    let state = {
      todos: [
        {
          title: "walk the cat",
          subtitle: "ok",
          colour: "tomato",
        },
        {
          title: "shampoo the dog",
          subtitle: "thanks",
          colour: "gold",
        },
      ],
    }

    define(
      name,
      () => ({
        state,
      }),
      html`
        <ul>
          <template :each="todo in todos">
            <li style="background-color: {{todo.colour}}">
              <p>{{todo.title}}</p>
            </li>
          </template>
        </ul>
      `
    )

    mount(html`<${name}></${name}>`)

    let todos = Array.from(state.todos)

    assert.equal($$("li").length, "2")

    $$("li").forEach((li, i) => {
      assert.equal(li.querySelector("p").textContent, todos[i].title)
    })
  })

  it("should iterate over Array keys", () => {
    let name = createName()

    let state = {
      colours: ["gold", "tomato"],
    }

    define(
      name,
      () => ({
        state,
      }),
      html`
        <ul>
          <li :each="(index, colour) in colours" :data-index="{{ index }}">
            <p>{{ index }}</p>
            <p>{{ colour }}</p>
          </li>
        </ul>
      `
    )

    mount(html`<${name}></${name}>`)

    $$("li").forEach((li, i) => {
      assert.equal(li.querySelector("p").textContent, i)
      assert.equal(li.dataset.index, i)
    })
  })

  it("should overwrite non-keyed list nodes", async () => {
    let name = createName()

    define(
      name,
      () => ({
        state: {
          $colours: [
            {
              name: "red",
            },
            {
              name: "green",
            },
            {
              name: "gold",
            },
          ],
        },
      }),
      html`
        <template :each="colour in $colours">
          <p>{{colour.name}}</p>
        </template>
      `
    )

    mount(html`<${name}></${name}>`)

    let previousNodes = $$("p")

    $(name).colours = [
      {
        name: "red",
      },
      {
        name: "red",
      },
      {
        name: "red",
      },
    ]

    await nextFrame()

    let currentNodes = $$("p")

    assert.ok(previousNodes[0].isSameNode(currentNodes[0]))
    assert.ok(previousNodes[1].isSameNode(currentNodes[1]))
    assert.ok(previousNodes[2].isSameNode(currentNodes[2]))
  })

  it("should not overwrite non-keyed list nodes (custom key)", async () => {
    let name = createName()

    define(
      name,
      () => ({
        observe: ["colours"],
        state: {
          colours: [
            {
              name: "red",
              foo: 1,
            },
            {
              name: "green",
              foo: 2,
            },
            {
              name: "gold",
              foo: 3,
            },
          ],
        },
      }),
      html`
        <template :each="colour in colours" :key="foo">
          <p>{{colour.name}}</p>
        </template>
      `
    )

    mount(html`<${name}></${name}>`)

    let previousNodes = $$("p")

    $(name).colours = [
      {
        name: "red",
        foo: 2,
      },
      {
        name: "red",
        foo: 1,
      },
      {
        name: "red",
        foo: 3,
      },
    ]

    await nextFrame()

    let currentNodes = $$("p")

    assert.ok(previousNodes[0].isSameNode(currentNodes[1]))
    assert.ok(previousNodes[1].isSameNode(currentNodes[0]))
    assert.ok(previousNodes[2].isSameNode(currentNodes[2]))
  })

  it("should support multiple top-level nodes", () => {
    let name = createName()

    let state = {
      colours: [
        {
          name: "red",
          id: 1,
        },
        {
          name: "green",
          id: 2,
        },
        {
          name: "gold",
          id: 3,
        },
      ],
    }

    define(
      name,
      () => ({
        state,
      }),
      html`
        <div>
          <template :each="colour in colours">
            <p>{{colour.name}}</p>
            <p>{{colour.id}}</p>
          </template>
        </div>
      `
    )

    mount(html`<${name}></${name}>`)

    assert.deepEqual(
      $$(`${name} p`).map((v) => v.textContent),
      ["red", "1", "green", "2", "gold", "3"]
    )
  })

  it("should support negations within repeated block", () => {
    let name = createName()

    let state = {
      colours: [
        {
          name: "red",
          id: 1,
          show: true,
        },
        {
          name: "green",
          id: 2,
          show: false,
        },
        {
          name: "gold",
          id: 3,
          show: false,
        },
      ],
    }

    define(
      name,
      () => ({
        state,
      }),
      html`
        <div>
          <div
            :each="colour in colours"
            class="colour"
            :hidden="{{ !colour.show }}"
          >
            <p>{{colour.name}}</p>
            <p>{{colour.id}}</p>
          </div>
        </div>
      `
    )

    mount(html`<${name}></${name}>`)

    assert.equal($$(".colour")[0].hidden, false)
    assert.equal($$(".colour")[1].hidden, true)
    assert.equal($$(".colour")[2].hidden, true)
  })

  it("should work without templates", () => {
    let name = createName()

    let state = {
      todos: [
        {
          title: "walk the cat",
          subtitle: "ok",
          colour: "tomato",
        },
        {
          title: "shampoo the dog",
          subtitle: "thanks",
          colour: "gold",
        },
      ],
    }

    define(
      name,
      () => ({
        state,
      }),
      html`
        <ul>
          <li :each="todo in todos" style="background-color: {{todo.colour}}">
            <p>{{todo.title}}</p>
          </li>
        </ul>
      `
    )

    mount(html`<${name}></${name}>`)

    let todos = Array.from(state.todos)

    let listItems = $$("li")

    assert.equal(listItems.length, 2)

    $$("li").forEach((li, i) => {
      assert.equal(li.querySelector("p").textContent, todos[i].title)
    })
  })

  it("works with Objects too", () => {
    let name = createName()

    let state = {
      foo: {
        0: 25,
        1: 38,
        2: 19,
        3: 10,
        4: 8,
        foo: "bar",
      },
    }

    define(
      name,
      () => ({
        state,
      }),
      html` <p :each="(k, v) in foo">{{ k }} : {{ v }}</p> `
    )

    mount(html`<${name}></${name}>`)

    let nodes = $$("p")

    assert.equal(nodes.length, Object.keys(state.foo).length)

    Object.entries(state.foo).forEach(([k, v], i) => {
      assert.equal(nodes[i].textContent, `${k} : ${v}`)
    })
  })

  it("works with SVG", () => {
    let name = createName()

    let state = {
      items: [
        {
          x: 0,
          y: 0,
          fill: "red",
          width: 16,
          height: 16,
        },
        {
          x: 0,
          y: 16,
          fill: "green",
          width: 64,
          height: 16,
        },
        {
          x: 0,
          y: 32,
          fill: "gold",
          width: 32,
          height: 16,
        },
      ],
    }

    define(
      name,
      () => ({
        state,
      }),
      html`
        <svg
          version="1.1"
          width="300"
          height="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            class="foo"
            :each="item in items"
            :x="{{ item.x }}"
            :y="{{ item.y }}"
            :fill="{{ item.fill }}"
            :width="{{ item.width }}"
            :height="{{ item.height }}"
          ></rect>
        </svg>
      `
    )

    mount(html`<${name}></${name}>`)

    let nodes = $$(".foo").slice(1)

    assert.equal(nodes.length, state.items.length)

    state.items.forEach(({ width, height, x, y }, i) => {
      let box = nodes[i].getBBox()
      assert.equal(box.x, x)
      assert.equal(box.y, y)
      assert.equal(box.width, width)
      assert.equal(box.height, height)
    })
  })

  it("works as expected", async () => {
    let name = createName()

    mount(html`<${name}></${name}>`)

    define(
      name,
      () => {
        return {
          state: {
            todos: [
              {
                title: "foo",
                completed: false,
              },
              {
                title: "bar",
                completed: true,
              },
            ],
          },
          update: {
            addTodo: (state, { event: { key } }) => {
              if (key !== "Enter" || !state.newTodo?.length) return state

              return {
                ...state,
                newTodo: null,
                todos: state.todos.concat({
                  title: state.newTodo,
                  completed: false,
                }),
              }
            },
            removeTodo: (state, { scope: { todo } }) => {
              return {
                ...state,
                todos: state.todos.filter(({ title }) => title !== todo.title),
              }
            },
          },
          getState: (state) => {
            return {
              ...state,
              itemsLeft: state.todos.filter(({ completed }) => !completed)
                .length,
            }
          },
        }
      },
      /* html */ `
            <input :name="newTodo" :onkeyup="addTodo" placeholder="What needs to be done?">
            <ul>
                <li :each="todo in todos">
                    <input type="checkbox" :name="todo.completed">
                    {{ todo.title }}
                    <button :onclick="removeTodo">[x]</button>
                </li>
            </ul>
            <p>{{ itemsLeft }}</p>
    
    `
    )

    const [_, secondButton] = $$(`button`)

    secondButton.click()

    await nextFrame()

    assert.equal($(`input[type="checkbox"]`).checked, false)
  })
})
