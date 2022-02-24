describe("events", () => {
  let rootNode

  beforeEach(() => {
    rootNode = mount(html`<div id="container"></div>`)
  })

  it("should support invocation of named function with parentheses but without arguments", async () => {
    let args

    let name = createName()

    synergy.define(
      name,
      () => {
        return {
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
      },
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

    synergy.define(
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

    synergy.define(
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
