const idTpl = (strings, ...values) => {
  return strings.reduce((a, s, i) => a + s + (values[i] || ""), "")
}

const html = idTpl

const simpleComponent = {
  title: "simple component",
  description: `
    
    `,
}

simpleComponent.code = html`
  <hello-world></hello-world>
  <script type="module">
    import { define } from "https://unpkg.com/synergy@8.0.0"

    const name = "hello-world"
    const factory = () => ({ initialState: { name: "world" } })
    const template = "<p>hello {{ name }}!</p>"

    define(name, factory, template)
  </script>
`

const dollarVars = {
  title: "configurable attributes",
  description: `
      
      `,
}

dollarVars.code = html`
  <hello-world name="kimberley"></hello-world>
  <script type="module">
    import { define } from "https://unpkg.com/synergy@8.0.0"

    const name = "hello-world"
    const factory = () => ({ initialState: { $name: "world" } })
    const template = "<p>hello {{ $name }}!</p>"

    define(name, factory, template)
  </script>
`

const stateUpdate = {
  title: "Events, Actions, and state updates",
  description: ``,
}

stateUpdate.code = html`
  <hello-world" name="matthew"></hello-world>
  <script type="module">
    import { define } from "https://unpkg.com/synergy@8.0.0"

    const name = "hello-world"
    const factory = () => ({
      initialState: { salutation: "hello", $name: "world" },
      update: {
        toggle: (state) => ({
          ...state,
          salutation: state.salutation === "hello" ? "goodbye" : "hello",
        }),
      },
    })
    const template = \`
        <p>{{ salutation }} {{ $name }}!</p>
        <button :onclick="toggle">toggle</button>
    \`

    define(name, factory, template)
  </script>
`

export const examples = [simpleComponent, dollarVars, stateUpdate]
