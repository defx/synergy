import { define } from "../src/index.js"

describe("define", () => {
  it("should define a custom element", () => {
    let name = createName()
    define(name, () => {}, "")
    assert.ok(customElements.get(name))
  })

  it("initialise factory with node", () => {
    let name = createName()
    let el
    define(
      name,
      (node) => {
        el = node
        return { update: () => {} }
      },
      "<p></p>"
    )
    mount(`
      <${name}></${name}>
      `)

    assert.equal($(name), el)
  })

  it("accepts template element", () => {
    let name = createName()

    let template = document.createElement("template")
    template.innerHTML = "<p>{{ title }}</p>"
    define(
      name,
      () => ({
        state: {
          title: "ok!",
        },
      }),
      template
    )
    mount(`
      <${name}></${name}>
      `)

    assert.equal($("p").textContent, "ok!")
  })

  it("reflects observed attribute changes on to viewmodel", async () => {
    let name = createName()
    define(
      name,
      () => ({ observe: ["title"], state: { title: "" } }),
      "<p>{{ title }}</p>"
    )
    mount(`
      <${name} title="ok!"></${name}>
      `)
    $(name).setAttribute("title", "foo!")
    await nextFrame()
    assert.equal($(`${name} p`).textContent, "foo!")
  })

  it("reflects viewmodel changes back on to attributes", async () => {
    let name = createName()

    define(
      name,
      () => ({
        state: {
          show: true,
        },
        update: {
          toggle: (state) => ({
            ...state,
            show: !state.show,
          }),
        },
      }),
      '<p :hidden="{{ !show }}">hello world!</p><button :onclick="toggle">toggle</button>'
    )
    mount(`
      <${name}></${name}>
      `)
    let el = $("p")
    assert.ok(el.hasAttribute("hidden") === false)
    $(`${name} button`).click()
    await nextFrame()
    assert.ok(el.hasAttribute("hidden"))
  })

  it("merges default slot", () => {
    let name = createName()
    define(
      name,
      () => ({}),
      html`<p>hello <slot></slot>!</p>
        !`
    )
    mount(`
          <${name}>world</${name}>
          `)

    assert.equal($(`${name} p`).innerText.trim(), "hello world!")
  })

  it("merges named slots", () => {
    let name = createName()
    define(
      name,
      () => ({}),
      html`<p>
        <slot name="foo"></slot><slot name="bar"></slot><slot>hello</slot>
      </p>`
    )
    mount(`
          <${name}><span slot="foo">!</span></${name}>
          `)

    assert.equal($(`${name} p`).innerHTML.trim(), "<span>!</span>hello")
  })

  it("converts between kebab and pascal casing", async () => {
    let name = createName()

    define(
      name,
      () => ({
        observe: ["fooBar"],
        state: {
          fooBar: false,
        },
        update: {
          toggle: (state) => ({ ...state, fooBar: !state.fooBar }),
        },
      }),
      html`<button :onclick="toggle">ok</button>`
    )
    mount(`
    <${name} foo-bar></${name}>
    `)

    assert.equal($(name).fooBar, true)

    $("button").click()
    await nextFrame()

    assert.equal($(`${name}`).hasAttribute("foo-bar"), false)
  })

  it("correctly handles aria string booleans", async () => {
    let name = createName()

    define(
      name,
      () => ({
        observe: ["ariaHidden"],
        state: {
          ariaHidden: true,
        },
        update: {
          toggle: (state) => {
            return {
              ...state,
              ariaHidden: !state.ariaHidden,
            }
          },
        },
      }),
      html`<button :onclick="toggle">ok</button>`
    )
    mount(`
    <${name} aria-hidden="false"></${name}>
    `)

    $("button").click()
    await nextFrame()
    assert.equal($(`${name}`).getAttribute("aria-hidden"), "true")
  })

  it("forwards lifecycle events", async () => {
    let name = createName()

    let connected = false
    let disconnected = false
    let factory = () => {
      return {
        connectedCallback() {
          connected = true
        },
        disconnectedCallback() {
          disconnected = true
        },
      }
    }
    define(name, factory, "<template></template>")
    mount(`
    <${name}></${name}>
    `)
    assert.ok(connected)
    assert.notOk(disconnected)
    $(name).remove()
    /*
    
    we need to wait here as synergy will avoid triggering lifecycle events if element is reconnected within the same frame (as can happen during a manual content slot)
    
    */
    await nextFrame()
    assert.ok(disconnected)
  })

  it("optionally supports shadow root", () => {
    let factory = () => ({ shadow: "open" })

    let template = html`
      <style>
        :host {
          background-color: gold;
          color: #222;
          padding: 1rem;
        }
      </style>
      <slot></slot>
    `

    define("x-shadow", factory, template)

    mount(html`<x-shadow>hello shadow</x-shadow>`)

    let node = $("x-shadow")

    assert.ok(node.shadowRoot)
  })

  it("accepts rich data as properties", async () => {
    define(
      "rich-props",
      () => ({
        observe: ["arr", "obj"],
        state: {
          arr: [],
          obj: {},
        },
      }),
      `
    <h3>{{ obj.repo }}</h3>
    <p :each="item in arr">{{ item }}</p>
    `
    )

    let name = createName()

    const letters = "synergy".split("")

    const framework = {
      repo: "defx/synergy",
    }

    define(
      name,
      () => ({
        state: {
          letters,
          framework,
        },
      }),
      html`
        <rich-props :arr="{{ letters }}" :obj="{{ framework }}"></rich-props>
      `
    )

    mount(html`<${name}></${name}>`)

    await nextFrame()

    const renderedLetters = $$("p").map((v) => v.textContent)
    assert.equal($("h3").textContent, framework.repo)
    assert.equal(letters.join(""), renderedLetters.join(""))
  })

  it("reflects observed properties from viewmodel to element", async () => {
    let name = createName()

    define(
      name,
      () => ({
        observe: ["foo"],
        state: {
          foo: "",
        },
        update: {
          updateFoo: (state) => ({
            ...state,
            foo: "baz",
          }),
        },
      }),
      html` <p :onclick="updateFoo" foo="bar">{{ foo }}</p> `
    )

    mount(`<${name}></${name}>`)

    $(`p`).click()

    await nextFrame()

    assert.equal($(name).foo, "baz")
  })

  it("supports async initialisation", async () => {
    // @todo: improve this
    let name = createName()

    define(
      name,
      () =>
        Promise.resolve({
          state: {
            foo: "bar",
          },
        }),
      html` <p>{{ foo }}</p> `
    )

    mount(`<${name}></${name}>`)

    assert.ok($(name))
    assert.equal($(name).textContent.trim(), "")

    await nextFrame()
    assert.equal($(name).innerText.trim(), "bar")
  })
})
