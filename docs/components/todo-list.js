import { define } from "../synergy.js"

define(
  "todo-list",
  () => {
    return {
      state: {
        todos: [],
      },
      update: {
        addTodo: (state, { event: { key } }) => {
          if (key !== "Enter" || !state.newTodo?.length) return state

          return {
            ...state,
            newTodo: null,
            todos: state.todos.concat({
              title: state.newTodo,
              completed: false,
            }),
          }
        },
        removeTodo: (state, { scope }) => {
          return {
            ...state,
            todos: state.todos.filter(({ title }) => title !== scope.title),
          }
        },
      },
      derive: {
        itemsLeftText: ({ todos }) => {
          const incomplete = todos.filter(({ completed }) => !completed)
          if (incomplete.length === 1) return `1 item left`
          return `${incomplete.length} items left`
        },
      },
    }
  },
  /* html */ `
        <input :name="newTodo" :onkeyup="addTodo" placeholder="What needs to be done?">
        <ul>
            <li :each="todos">
                <input type="checkbox" :name="completed">
                {{ title }}
                <button :onclick="removeTodo">[x]</button>
            </li>
        </ul>
        <p>{{ itemsLeftText }}</p>

`
)
