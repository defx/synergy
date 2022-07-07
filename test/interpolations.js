import { define } from "../src/index.js"

describe("interpolations", () => {
  it("should always cast primitive values to strings, unless null or undefined", () => {
    let name = createName()

    define(
      name,
      () => ({
        state: {
          boolean: false,
          undefined: undefined,
          null: null,
          number: 0,
          string: "string",
          foo: "bar",
        },
      }),
      html`
        <ul>
          <li id="boolean">{{ boolean }}</li>
          <li id="undefined">{{ undefined }}</li>
          <li id="null">{{ null }}</li>
          <li id="number">{{ number }}</li>
          <li id="string">{{ string }}</li>
        </ul>
      `
    )

    mount(html`<${name}></${name}>`)

    assert.equal($("#boolean").textContent, "false")
    assert.equal($("#undefined").textContent, "")
    assert.equal($("#null").textContent, "")
    assert.equal($("#number").textContent, "0")
    assert.equal($("#string").textContent, "string")
  })

  it("should support multiple bindings", () => {
    let name = createName()

    define(
      name,
      () => ({
        state: {
          c1: "red",
          c2: "green",
        },
      }),
      html` <p>{{c1}} + {{c2}}</p> `
    )

    mount(html`<${name}></${name}>`)

    assert.equal($("p").textContent, "red + green")
  })

  it("should apply all the values", () => {
    let name = createName()

    define(
      name,
      () => ({
        state: {
          classes: ["one", "two", "three"],
        },
      }),
      html`<section :class="{{classes}}"></section>`
    )

    mount(html`<${name}></${name}>`)

    assert.equal($("section").className, "one two three")
  })

  it("should apply all the keys with truthy values", () => {
    let name = createName()

    define(
      name,
      () => ({
        state: {
          classes: {
            one: true,
            two: false,
            three: {},
            four: null,
            five: "",
            six: "ok",
          },
        },
      }),
      html` <section :class="{{classes}}"></section> `
    )

    mount(html`<${name}></${name}>`)

    assert.equal($("section").className, "one three six")
  })

  it("should apply styles", () => {
    let name = createName()

    define(
      name,
      () => ({
        state: {
          foo: `
            background-color: gold;
            color: tomato;
            width: 100px;
            height: 100px;
          `,
        },
      }),
      html` <section :style="{{foo}}"></section> `
    )

    mount(html`<${name}></${name}>`)

    assert.equal(
      $("section").getAttribute("style"),
      "background-color: gold; color: tomato; width: 100px; height: 100px;"
    )
  })

  it("should preserve browser styles", async () => {
    let name = createName()

    define(
      name,
      () => ({
        observe: ["foo"],
        state: {
          foo: `
          background-color: gold;
          color: tomato;
          width: 100px;
          height: 100px;
          `,
        },
      }),
      html` <section :style="{{ foo }}"></section> `
    )

    mount(html`<${name}></${name}>`)

    $("section").style.opacity = "0.5"

    assert.ok(
      $("section").getAttribute("style").includes("background-color: gold;")
    )

    $(name).foo = `
      background-color: tomato;
      color: gold;
      width: 100px;
      height: 100px;
  `

    await nextFrame()

    assert.ok(
      $("section").getAttribute("style").includes("background-color: tomato;")
    )

    assert.ok($("section").getAttribute("style").includes("opacity: 0.5;"))
  })

  it("should apply styles (Object / kebab)", () => {
    let name = createName()

    define(
      name,
      () => ({
        state: {
          foo: {
            "background-color": "gold",
            color: "tomato",
            width: "100px",
            height: "100px",
          },
        },
      }),
      html` <section :style="{{foo}}"></section> `
    )

    mount(html`<${name}></${name}>`)

    assert.equal(
      $("section").getAttribute("style"),
      "background-color: gold; color: tomato; width: 100px; height: 100px;"
    )
  })

  it("should apply styles (Object / pascal)", () => {
    let name = createName()

    define(
      name,
      () => ({
        state: {
          foo: {
            backgroundColor: "gold",
            color: "tomato",
            width: "100px",
            height: "100px",
          },
        },
      }),
      html` <section :style="{{foo}}"></section> `
    )

    mount(html`<${name}></${name}>`)

    assert.equal(
      $("section").getAttribute("style"),
      "background-color: gold; color: tomato; width: 100px; height: 100px;"
    )
  })

  it("should allow whitespace formatting", () => {
    let name = createName()

    define(
      name,
      () => ({
        state: {
          c1: "red",
          c2: "green",
        },
      }),
      html` <p :name="{{ c1 }}">{{ c2 }}</p> `
    )

    mount(html`<${name}></${name}>`)

    assert.equal($("p").getAttribute("name"), "red")
    assert.equal($("p").textContent, "green")
  })

  it("should support negation", async () => {
    let name = createName()

    define(
      name,
      () => ({
        observe: ["foo"],
        state: { foo: true },
      }),
      html` <p :hidden="{{ !foo }}">boo!</p>`
    )

    mount(html`<${name} foo></${name}>`)

    assert.notOk($("p").hidden) // [hidden]

    $(name).foo = false

    await nextFrame()

    assert.ok($("p").hidden)
  })

  it("should support square brackets", () => {
    let name = createName()

    define(
      name,
      () => ({
        state: {
          columns: ["one", "two", "three"],
          rows: [
            {
              one: 1,
              two: 2,
              three: 3,
            },
            {
              one: 3,
              two: 2,
              three: 1,
            },
            {
              one: 1,
              two: 3,
              three: 2,
            },
          ],
        },
      }),
      html`
        <table>
          <tr>
            <th :each="column in columns">{{ column }}</th>
          </tr>
          <tr :each="row in rows">
            <td :each="col in columns">{{ row[col] }}</td>
          </tr>
        </table>
      `
    )

    mount(html`<${name}></${name}>`)

    assert.equal($$("th").length, 3)
    assert.equal($$("tr").length, 4)
    assert.deepEqual(
      $$("td").map((v) => v.textContent.trim()),
      ["1", "2", "3", "3", "2", "1", "1", "3", "2"]
    )
  })

  it("resolves properties from the current item first", () => {
    let name = createName()

    let state = {
      foo: "bar",
      items: [
        {
          x: 0,
        },
        {
          x: 16,
        },
        {
          x: 32,
        },
      ],
    }

    define(
      name,
      () => ({
        state,
      }),
      html`
        <div
          class="foo"
          :each="item in items"
          :x="{{ x }}"
          :foo="{{ foo }}"
        ></div>
      `
    )

    mount(html`<${name}></${name}>`)

    let nodes = $$(".foo")

    assert.equal(nodes.length, state.items.length)

    state.items.forEach(({ x }, i) => {
      let node = nodes[i]
      assert.equal(node.getAttribute("x"), x)
      assert.equal(node.getAttribute("foo"), state.foo)
    })
  })

  it("supports simple each (just the collection property)", () => {
    let name = createName()

    let state = {
      foo: "bar",
      items: [
        {
          x: 0,
        },
        {
          x: 16,
        },
        {
          x: 32,
        },
      ],
    }

    define(
      name,
      () => ({
        state,
      }),
      html`
        <div class="foo" :each="items" :x="{{ x }}" :foo="{{ foo }}"></div>
      `
    )

    mount(html`<${name}></${name}>`)

    let nodes = $$(".foo")

    assert.equal(nodes.length, state.items.length)

    state.items.forEach(({ x }, i) => {
      let node = nodes[i]
      assert.equal(node.getAttribute("x"), x)
      assert.equal(node.getAttribute("foo"), state.foo)
    })
  })

  it("supports shorthand attributes (when attribute name matches property name)", () => {
    let name = createName()

    let state = {
      foo: "bar",
      items: [
        {
          x: 0,
        },
        {
          x: 16,
        },
        {
          x: 32,
        },
      ],
    }

    define(
      name,
      () => ({
        state,
      }),
      html` <div class="foo" :each="items" :x :foo></div> `
    )

    mount(html`<${name}></${name}>`)

    let nodes = $$(".foo")

    assert.equal(nodes.length, state.items.length)

    state.items.forEach(({ x }, i) => {
      let node = nodes[i]
      assert.equal(node.getAttribute("x"), x)
      assert.equal(node.getAttribute("foo"), state.foo)
    })
  })
})
