import { define } from "../synergy.js"

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
      connectedCallback: ({ dispatch, getState }) => {
        console.log("connected", getState())
        t = setInterval(() => {
          dispatch({
            type: "setTime",
            payload: new Date().toLocaleTimeString(),
          })
        }, 100)
      },
      disconnectedCallback: () => {
        console.log("disconnected")
        clearInterval(t)
      },
    }
  },
  /* html */ `
    <p>{{ time }}</p>
`
)
