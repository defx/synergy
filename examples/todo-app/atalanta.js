export const storage = {
  get: (k) => JSON.parse(localStorage.getItem(k)),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
}

const filters = {
  all: (todos) => todos,
  active: (todos) => todos.filter(({ completed }) => !completed),
  done: (todos) => todos.filter(({ completed }) => completed),
}

const KEYS = {
  RETURN: 13,
  ESCAPE: 27,
}

const defaultState = {
  filters: Object.keys(filters),
  todos: [],
  activeFilter: "all",
}

/* this can also potentially be abstracted away in the template with something like :onkeydown|esc */

export const preUpdate = (action, { dispatch }) => {
  switch (action.type) {
    case "keydown": {
      const { keyCode } = action.event
      switch (keyCode) {
        case KEYS.ESCAPE: {
          dispatch({ type: "cancelEdit" })
          break
        }
        case KEYS.RETURN: {
          dispatch({ type: "saveEdit" })
          break
        }
      }
    }
  }
}

/*

called after update + nextAnimationFrame (so the DOM now reflects the last change)

*/

export const postUpdate = (action, { getState }) => {
  switch (action.type) {
    case "startEdit": {
      action.event.target.parentNode.querySelector(".edit").focus()
    }
  }

  storage.set("todos", getState().todos)
}

export const derived = {
  allDone: ({ todos }) => todos.every((todo) => todo.completed),
  filteredTodos: ({ todos, activeFilter }) => filters[activeFilter](todos),
  numCompleted: ({ todos }) =>
    todos.filter(({ completed }) => completed).length,
  itemsLeft: ({ todos }) => {
    const n = todos.filter(({ completed }) => !completed).length
    return `${n} item${n === 1 ? "" : "s"} left`
  },
}

export const update = (state = defaultState, action) => {
  const { context, event } = action

  switch (action.type) {
    case "toggleAll": {
      return {
        ...state,
        allDone,
        todos: state.todos.map((todo) => ({ ...todo, completed: allDone })),
      }
    }
    case "todoInput": {
      if (event.keyCode === KEYS.RETURN) {
        return {
          ...state,
          todos: state.todos.concat([{ title: state.newTodo, id: Date.now() }]),
          newTodo: null,
        }
      } else {
        return {
          ...state,
          newTodo: title,
        }
      }
    }
    case "startEdit": {
      const todos = state.todos.map((todo) => ({
        ...todo,
        editing: todo.id === context.todo.id,
      }))
      const titleEdit = todos.find((todo) => todo.editing)?.title
      return {
        ...state,
        titleEdit,
        todos,
      }
    }
    case "deleteTodo": {
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== context.todo.id),
      }
    }
    case "removeCompleted": {
      return {
        ...state,
        todos: state.todos.filter(({ completed }) => !completed),
      }
    }
    case "cancelEdit": {
      return {
        ...state,
        titleEdit: "",
        todos: state.todos.map((todo) => ({
          ...todo,
          editing: false,
        })),
      }
    }
    case "saveEdit": {
      const todos = state.todos.map((todo) => {
        return {
          ...todo,
          title: todo.editing ? state.titleEdit : todo.title,
          editing: false,
        }
      })
      return {
        ...state,
        todos,
      }
    }
    default:
      return state
  }
}

export const markup = html`
  <style>
    .edit {
      display: none;
    }
    [editing] .edit {
      display: initial;
    }
    [editing] .toggle,
    [editing] label {
      display: none;
    }
    .delete {
      display: none;
    }
    li:hover:not([editing]) .delete {
      display: initial;
    }
  </style>
  <header>
    <h1>todos</h1>
    <input
      autofocus
      autocomplete="off"
      placeholder="What needs to be done?"
      :name="newTodo"
      :onkeydown="todoInput"
    />
  </header>
  <main :hidden="{{ !todos.length }}">
    <label for="allDone">Mark all as complete</label>
    <input id="allDone" type="checkbox" :name="allDone" :onchange="toggleAll" />
    <ul>
      <li
        class="todo"
        :is-done="completed"
        :editing="editing"
        key="id"
        :each="todo in filteredTodos"
      >
        <input class="toggle" type="checkbox" :name="completed" />
        <label :ondblclick="startEdit">{{title}}</label>
        <input
          class="edit"
          :name="titleEdit"
          :onblur="saveEdit"
          :onkeydown="keydown"
        />
        <button class="delete" :onclick="deleteTodo">[delete]</button>
      </li>
    </ul>
  </main>
  <footer :hidden="{{ !todos.length }}">
    <p id="count">{{ itemsLeft }}</p>
    <ul id="filterList">
      <li :each="filter in filters">
        <input type="radio" :name="activeFilter" :value="filter" />
        <label>{{ filter }}</label>
      </li>
    </ul>
    <button
      id="clearCompleted"
      :hidden="{{ !numCompleted }}"
      :onclick="removeCompleted"
    >
      clear completed ({{ numCompleted }})
    </button>
  </footer>
`
