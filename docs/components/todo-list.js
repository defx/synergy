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
        removeTodo: (state, { scope: { todo } }) => {
          return {
            ...state,
            todos: state.todos.filter(({ title }) => title !== todo.title),
          }
        },
      },
      getState: (state) => {
        return {
          ...state,
          itemsLeft: itemsLeft(state),
        }
      },
    }
  },
  /* html */ `
        <input :name="newTodo" :onkeyup="addTodo" placeholder="What needs to be done?">
        <ul>
            <li :each="todo in todos">
                <input type="checkbox" :name="todo.completed">
                {{ todo.title }}
                <button :onclick="removeTodo">[x]</button>
            </li>
        </ul>
        <p>{{ itemsLeft }}</p>

`
)
