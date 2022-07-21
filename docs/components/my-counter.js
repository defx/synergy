import { define } from "../synergy.js"

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

const template = /* html */ `
    <button :onclick="increment">Count is: {{ count }}</button>
`

const css = /* css */ `
  button {
    cursor: pointer;
    padding: 0.5rem 1rem;
    background-color: gold;
    color: tomato;
  }
`

define(name, factory, template)
