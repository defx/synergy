import { define } from "../src/index.js"

describe("actions", () => {
  it("dispatches the action", () => {
    let stack = []

    let name = createName()

    let state = {
      artists: [
        {
          name: "pablo picasso",
          tags: [
            "painter",
            "sculptor",
            "printmaker",
            "ceramicist",
            "theatre designer",
          ],
        },
        {
          name: "salvador dali",
          tags: ["painter", "sculptor", "photographer", "writer"],
        },
      ],
    }

    define(
      name,
      () => ({
        update: {
          foo: (state) => {
            stack.push("foo")
            return state
          },
        },
        state,
      }),
      html`
        <article :each="artist in artists">
          <h4>{{artist.name}}</h4>
          <ul>
            <li :each="tag in artist.tags" :onclick="foo">{{tag}}</li>
          </ul>
        </article>
      `
    )

    mount(html`<${name}></${name}>`)

    $("article:nth-of-type(2) li").click() //salvador dali painter

    assert.equal(stack.length, 1)
    assert.equal(stack[0], "foo")
  })

  it("provides the template scope", () => {
    let stack = []

    let name = createName()

    let state = {
      artists: [
        {
          name: "pablo picasso",
          tags: [
            "painter",
            "sculptor",
            "printmaker",
            "ceramicist",
            "theatre designer",
          ],
        },
        {
          name: "salvador dali",
          tags: ["painter", "sculptor", "photographer", "writer"],
        },
      ],
    }

    define(
      name,
      () => ({
        update: {
          foo: (state, { scope }) => {
            stack.push(scope)
            return state
          },
        },
        state,
      }),
      html`
        <article :each="artist in artists">
          <h4>{{artist.name}}</h4>
          <ul>
            <li :each="tag in artist.tags" :onclick="foo">{{tag}}</li>
          </ul>
        </article>
      `
    )

    mount(html`<${name}></${name}>`)

    $("article:nth-of-type(2) li").click() //salvador dali painter

    assert.equal(stack.length, 1)
    assert.equal(stack[0].artists.length, 2)
    assert.equal(stack[0].artist.name, "salvador dali")
    assert.equal(stack[0].tag, "painter")
  })

  it("provides the event object", () => {
    let stack = []

    let name = createName()

    let state = {
      artists: [
        {
          name: "pablo picasso",
          tags: [
            "painter",
            "sculptor",
            "printmaker",
            "ceramicist",
            "theatre designer",
          ],
        },
        {
          name: "salvador dali",
          tags: ["painter", "sculptor", "photographer", "writer"],
        },
      ],
    }

    define(
      name,
      () => ({
        update: {
          foo: (state, { event }) => {
            stack.push(event)
            return state
          },
        },
        state,
      }),
      html`
        <article :each="artist in artists">
          <h4>{{artist.name}}</h4>
          <ul>
            <li :each="tag in artist.tags" :onclick="foo">{{tag}}</li>
          </ul>
        </article>
      `
    )

    mount(html`<${name}></${name}>`)

    $("article:nth-of-type(2) li").click() //salvador dali painter

    assert.equal(stack[0] instanceof MouseEvent, true)
    assert.equal(stack[0].target.nodeName, "LI")
  })

  it("allows child components to invoke dollar-prefixed actions up the tree", () => {
    let ancestor = createName()

    define(
      ancestor,
      () => ({
        update: {
          $sayHi: (state) => ({
            ...state,
            greet: true,
          }),
        },
        state: {
          greet: false,
        },
      }),
      `<p :hidden="!greet">hello!</p>`
    )

    let child = createName()

    define(child, () => ({}), `<button :onclick="$sayHi">say hi</button>`)

    mount(`
        <${ancestor}>
          <${child}></${child}>
        </${ancestor}>
      `)

    $(`${child} button`).click()

    assert.equal($(`${ancestor} p`).hidden, false)
  })
})
