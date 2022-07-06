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
    template.innerHTML = "<p>{{ $title }}</p>"
    define(
      name,
      () => ({
        initialState: {
          $title: "",
        },
      }),
      template
    )
    mount(`
      <${name} title="ok!"></${name}>
      `)

    assert.equal($("p").textContent, "ok!")
  })

  it("reflects attribute changes on to viewmodel", async () => {
    let name = createName()
    define(
      name,
      () => ({ initialState: { $title: "" } }),
      "<p>{{ $title }}</p>"
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
    let initialState = {
      show: true,
    }
    define(
      name,
      () => ({
        update: (state = initialState, action) => {
          switch (action.type) {
            case "toggle": {
              return {
                ...state,
                show: !state.show,
              }
            }
            default: {
              return { ...state }
            }
          }
        },
      }),
      '<p :hidden="{{ !show }}">hello world!</p><button :onclick="toggle">toggle</button>'
    )
    mount(`
      <${name}></${name}>
      `)
    $(`${name} button`).click()
    await nextFrame()
    let el = $("p")
    assert.ok(el.hasAttribute("hidden"))
  })

  it("merges default slot", () => {
    let name = createName()
    define(
      name,
      () => ({
        update: () => ({}),
      }),
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
      () => ({
        update: () => ({}),
      }),
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

    let initialState = {
      $fooBar: false,
    }

    define(
      name,
      () => ({
        update: {
          toggle: (state) => ({ ...state, $fooBar: !state.$fooBar }),
        },
        initialState,
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

    let initialState = {
      $ariaHidden: true,
    }

    define(
      name,
      () => ({
        update: {
          toggle: (state) => {
            return {
              ...state,
              $ariaHidden: !state.ariaHidden,
            }
          },
        },
        initialState,
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

  it("forwards lifecycle events", () => {
    let name = createName()

    let connected = false
    let disconnected = false
    let factory = () => {
      return {
        update(state = {}, action) {
          return state
        },
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
    assert.ok(disconnected)
  })

  it("optionally supports shadow root", () => {
    let factory = () => ({ update: () => ({}), shadow: "open" })

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

  it("accepts rich data as properties", () => {
    let factory = () => ({
      update: () => ({
        arr: [],
        obj: {},
      }),
    })

    let template = `
    <h2>{{ obj.org }}</h2>  
    <h3>{{ obj.repo }}</h3>
    <p :each="item in arr">{{ item }}</p>
    `

    define("rich-props", factory, template)

    let name = createName()

    define(
      name,
      () => {
        return {
          letters: "mosaic".split(""),
          library: {
            repo: "defx/mosaic",
          },
        }
      },
      html`
        <rich-props :arr="{{ letters }}" :obj="{{ library }}"></rich-props>
      `
    )

    mount(html`<${name}></${name}>`)

    //@todo ...assert or delete?
  })

  it("reflects observed properties from viewmodel to element", async () => {
    let name = createName()

    let initialState = {
      $foo: "",
    }

    define(
      name,
      () => ({
        update: {
          updateFoo: (state) => ({
            ...state,
            $foo: "baz",
          }),
        },
        initialState,
      }),
      html` <p :onclick="updateFoo" foo="bar">{{ $foo }}</p> `
    )

    mount(`<${name}></${name}>`)

    $(`p`).click()

    await nextFrame()

    assert.equal($(name).foo, "baz")
  })

  it("supports async initialisation", async () => {
    let name = createName()

    define(
      name,
      () =>
        Promise.resolve({
          initialState: {
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
