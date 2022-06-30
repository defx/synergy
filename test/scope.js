import { define } from "../src/index.js"

describe("scope", () => {
  let rootNode
  beforeEach(() => {
    rootNode = mount(html`<div id="container"></div>`)
  })

  it("should observe context", () => {
    let name = createName()

    let initialState = {
      todo: "feed the dog",
      message: "Hej!",
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
        initialState,
      }),
      html` <h1 first>{{todo}}</h1>
        <ul>
          <template each="todo in todos">
            <li style="background-color: {{todo.colour}}">
              <p>{{todo.title}}</p>
              <p>{{message}}</p>
            </li>
          </template>
        </ul>
        <h1 second>{{todo}}</h1>`
    )

    mount(html`<${name}></${name}>`)

    assert.equal($("h1[first]").textContent.trim(), "feed the dog")
    assert.equal($("li p").textContent.trim(), "walk the cat")
    assert.equal($("li p:last-child").textContent.trim(), "Hej!")
    assert.equal($("h1[second]").textContent.trim(), "feed the dog")
  })

  it("should support nested scopes", async () => {
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
        initialState,
      }),
      html`
        <template each="(i, artist) in artists">
          <article>
            <h4>{{artist.name}}</h4>
            <ul>
              <template each="(j, tag) in artist.tags">
                <li>{{tag}} {{i}}:{{j}}</li>
              </template>
            </ul>
          </article>
        </template>
      `
    )

    mount(html`<${name}></${name}>`)

    assert.equal($("h4").textContent, initialState.artists[0].name)
    assert.equal(
      $$("article:nth-of-type(1) li").length,
      initialState.artists[0].tags.length
    )
    assert.equal(
      $$("article:nth-of-type(2) li").length,
      initialState.artists[1].tags.length
    )
    assert.equal($("article:nth-of-type(1) li").textContent, "painter 0:0")
    assert.equal($("article:nth-of-type(2) li").textContent, "painter 1:0")
  })
})
