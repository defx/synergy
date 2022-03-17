import { define } from "../src/index.js"

describe.only("events", () => {
  it("dispatches the action", () => {
    let stack = []

    let name = createName()

    let initialState = {
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
        update: (state = initialState, action) => {
          switch (action.type) {
            case "foo": {
              stack.push("foo")
              return state
            }
            default:
              return state
          }
        },
      }),
      html`
        <article each="artist in artists">
          <h4>{{artist.name}}</h4>
          <ul>
            <li each="tag in artist.tags" :onclick="foo">{{tag}}</li>
          </ul>
        </article>
      `
    )

    mount(html`<${name}></${name}>`)

    $("article:nth-of-type(2) li").click() //salvador dali painter

    assert.equal(stack.length, 1)
    assert.equal(stack[0], "foo")
  })

  it("provides the template context", () => {
    let stack = []

    let name = createName()

    let initialState = {
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
        update: (state = initialState, action) => {
          switch (action.type) {
            case "foo": {
              stack.push(action.context)
              return state
            }
            default:
              return state
          }
        },
      }),
      html`
        <article each="artist in artists">
          <h4>{{artist.name}}</h4>
          <ul>
            <li each="tag in artist.tags" :onclick="foo">{{tag}}</li>
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

  it.only("provides the event object", () => {
    let stack = []

    let name = createName()

    let initialState = {
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
        update: (state = initialState, action) => {
          switch (action.type) {
            case "foo": {
              stack.push(action.event)
              return state
            }
            default:
              return state
          }
        },
      }),
      html`
        <article each="artist in artists">
          <h4>{{artist.name}}</h4>
          <ul>
            <li each="tag in artist.tags" :onclick="foo">{{tag}}</li>
          </ul>
        </article>
      `
    )

    mount(html`<${name}></${name}>`)

    $("article:nth-of-type(2) li").click() //salvador dali painter

    assert.equal(stack[0] instanceof PointerEvent, true)
    assert.equal(stack[0].target.nodeName, "LI")
  })

  it("should support invocation of named function with parentheses but without arguments", async () => {
    let args

    let name = createName()

    let initialState = {
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
      //   foo(...argz) {
      //     args = argz
      //   },
    }

    define(
      name,
      () => ({
        update: (state = initialState, action) => {
          switch (action.type) {
            case "foo": {
              return state
            }
            default:
              return state
          }
        },
      }),
      html`
        <article each="artist in artists">
          <h4>{{artist.name}}</h4>
          <ul>
            <li each="tag in artist.tags" :onclick="foo()">{{tag}}</li>
          </ul>
        </article>
      `
    )

    mount(html`<${name}></${name}>`)

    $("article:nth-of-type(2) li").click() //salvador dali painter

    await nextFrame()

    assert.deepEqual(args.length, 0)
  })

  it("should support scoped arguments", async () => {
    let args

    let name = createName()

    let view = {
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
      foo(...argz) {
        args = argz
      },
    }

    define(
      name,
      () => {
        return view
      },
      html`
        <article each="artist in artists">
          <h4>{{artist.name}}</h4>
          <ul>
            <li each="tag in artist.tags" :onclick="foo(tag,artist)">
              {{tag}}
            </li>
          </ul>
        </article>
      `
    )

    mount(html`<${name}></${name}>`)

    $("article:nth-of-type(2) li").click() //salvador dali painter

    await nextFrame()

    assert.equal(args[0], view.artists[1].tags[0])
    assert.deepEqual(args[1], view.artists[1])
  })

  it("should support fat arrow syntax for passing named event object", async () => {
    let args

    let name = createName()

    let view = {
      fish: "plankton",
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
      foo(...argz) {
        args = argz
      },
    }

    define(
      name,
      () => {
        return view
      },
      html`
        <article each="artist in artists">
          <h4>{{artist.name}}</h4>
          <ul>
            <li
              each="tag in artist.tags"
              :onclick="bar => foo(bar, tag, artist, fish)"
            >
              {{tag}}
            </li>
          </ul>
        </article>
      `
    )

    mount(html`<${name}></${name}>`)

    $("article:nth-of-type(2) li").click() //salvador dali painter

    await nextFrame()

    assert.ok(args[0] instanceof MouseEvent)
    assert.equal(args[1], view.artists[1].tags[0])
    assert.deepEqual(args[2], view.artists[1])
    assert.equal(args[3], view.fish)
  })
})
