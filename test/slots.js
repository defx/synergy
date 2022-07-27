import { define } from "../src/index.js"

describe("slots", () => {
  it("doesn't trigger the disconnectedCallback if reconnected within the same frame", async () => {
    mount(/* html */ `
        <x-app>
            <simple-clock></simple-clock>
        </x-foo>
    `)

    let callbacks = []

    define(
      "simple-clock",
      () => {
        let t
        return {
          update: {
            setTime: (state, { payload }) => {
              return {
                ...state,
                time: payload,
              }
            },
          },
          connectedCallback: ({ dispatch }) => {
            callbacks.push("connected")
            t = setInterval(() => {
              dispatch({
                type: "setTime",
                payload: new Date().toLocaleTimeString(),
              })
            }, 100)
          },
          disconnectedCallback: () => {
            callbacks.push("disconnected")
            clearInterval(t)
          },
        }
      },
      /* html */ `
            <p>{{ time }}</p>
        `
    )

    define(
      "x-app",
      () => ({}),
      /* html */ `
                <section>
                    <slot></slot>
                </section>
            `
    )

    await nextFrame()

    assert.equal(callbacks.length, 1)
    assert.equal(callbacks[0], "connected")
  })
})
