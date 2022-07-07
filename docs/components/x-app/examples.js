const idTpl = (strings, ...values) => {
  return strings.reduce((a, s, i) => a + s + (values[i] || ""), "")
}

const html = idTpl

export const myCounter = html`
  <my-counter></my-counter>

  <script type="module">
    import { define } from "https://unpkg.com/synergy@8.0.0"

    const name = "my-counter"

    const factory = () => ({
      state: { count: 0 },
      update: {
        increment: (state) => ({
          ...state,
          count: state.count + 1,
        }),
      },
    })

    define(name, factory, "#my-counter")
  </script>

  <template id="my-counter">
    <button :onclick="increment">Count is: {{ count }}</button>
  </template>
`
