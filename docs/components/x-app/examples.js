const idTpl = (strings, ...values) => {
  return strings.reduce(
    (a, s, i) => a + s + (values[i] || ""),
    ""
  )
}

const html = idTpl

const x = html` <hello-world> </hello-world>
  <!-- <hello-world><p>hello world!</p></hello-world> -->`

const simpleComponentDefinition = {
  title: "Example #1: Hello World!",
  items: [
    {
      description: `Create a new custom element by passing a name, factory, and template to the define function.`,
      code: html`
        <script type="module">
          import { define } from "https://unpkg.com/synergy@8.0.0"

          const name = "hello-world"

          const factory = () => ({
            state: { name: "world" },
          })

          const template = "<p>hello {{ name }}!</p>"

          define(name, factory, template)
        </script>
      `,
    },
    {
      description: `Once a custom element is defined then you can use it like any other HTML element`,
      code: html` <hello-world> </hello-world>
        <!-- <hello-world><p>hello world!</p></hello-world> -->`,
    },
    {
      description: `Dollar-prefixed state properties reflect any value provided to the element via its own attributes or properties`,
      code: html`
        <hello-world name="kimberley"> </hello-world>
        <!-- <hello-world><p>hello kimberley!</p></hello-world> -->

        <script type="module">
          import { define } from "https://unpkg.com/synergy@8.0.0"

          const name = "hello-world"
          const factory = () => ({
            state: { $name: "world" },
          })
          const template = "<p>hello {{ $name }}!</p>"

          define(name, factory, template)
        </script>
      `,
    },
  ],
}

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
      state: { salutation: "hello", $name: "world" },
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

export const examples = [simpleComponentDefinition]
