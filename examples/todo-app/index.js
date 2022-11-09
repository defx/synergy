export const storage = {
  get: (k) => {
    let v = JSON.parse(localStorage.getItem(k))
    return v
  },
  set: (k, v) => {
    localStorage.setItem(k, JSON.stringify(v))
  },
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

export const state = {
  filters: Object.keys(filters),
  todos: [],
  activeFilter: "all",
}

export const middleware = {
  keydown: (action, next) => {
    const { keyCode } = action.event

    switch (keyCode) {
      case KEYS.ESCAPE: {
        next({ ...action, type: "cancelEdit" })
        break
      }
      case KEYS.RETURN: {
        next({ ...action, type: "saveEdit" })
        break
      }
      default: {
        next(action)
      }
    }
  },
  startEdit: (action, next, { refs }) => {
    next(action).then(() => refs.titleEditInput?.focus())
  },
}

export const subscribe = (state) => {
  storage.set("todos", state.todos)
}

export const getState = (state) => {
  const { todos, activeFilter } = state
  const n = todos.filter(({ completed }) => !completed).length

  return {
    ...state,
    allDone: todos.every((todo) => todo.completed),
    filteredTodos: filters[activeFilter](todos),
    numCompleted: todos.filter(({ completed }) => completed).length,
    itemsLeft: `${n} item${n === 1 ? "" : "s"} left`,
  }
}

export const update = {
  toggleAll: (state, { event }) => {
    let allDone = event.target.checked
    return {
      ...state,
      allDone,
      todos: state.todos.map((todo) => ({ ...todo, completed: allDone })),
    }
  },
  todoInput: (state, { event }) => {
    if (event.keyCode === KEYS.RETURN) {
      return {
        ...state,
        todos: state.todos.concat({
          title: state.newTodo,
          id: Date.now(),
          completed: false,
        }),
        newTodo: null,
      }
    } else {
      return {
        ...state,
        newTodo: title,
      }
    }
  },
  startEdit: (state, { scope }) => {
    const todos = state.todos.map((todo) => ({
      ...todo,
      editing: todo.id === scope.todo.id,
    }))
    const titleEdit = todos.find((todo) => todo.editing)?.title
    return {
      ...state,
      titleEdit,
      todos,
    }
  },
  deleteTodo: (state, { scope }) => ({
    ...state,
    todos: state.todos.filter((todo) => todo.id !== scope.todo.id),
  }),
  removeCompleted: (state) => ({
    ...state,
    todos: state.todos.filter(({ completed }) => !completed),
  }),
  cancelEdit: (state) => ({
    ...state,
    titleEdit: "",
    todos: state.todos.map((todo) => ({
      ...todo,
      editing: false,
    })),
  }),
  saveEdit: (state) => {
    let titleEdit = state.titleEdit.trim()
    return {
      ...state,
      todos: titleEdit
        ? state.todos.map((todo) => {
            return {
              ...todo,
              title: todo.editing ? state.titleEdit : todo.title,
              editing: false,
            }
          })
        : state.todos.filter(({ editing }) => !editing),
    }
  },
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
  <main :hidden="!todos.length">
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
        <label :ondblclick="startEdit">{{ title }}</label>
        <input
          class="edit"
          :name="titleEdit"
          :onblur="saveEdit"
          :onkeydown="keydown"
          :ref="titleEditInput"
        />
        <button class="delete" :onclick="deleteTodo">[delete]</button>
      </li>
    </ul>
  </main>
  <footer :hidden="!todos.length">
    <p id="count">{{ itemsLeft }}</p>
    <ul id="filterList">
      <li :each="filter in filters">
        <input type="radio" :name="activeFilter" :value="filter" />
        <label>{{ filter }}</label>
      </li>
    </ul>
    <button
      id="clearCompleted"
      :hidden="!numCompleted"
      :onclick="removeCompleted"
    >
      clear completed ({{ numCompleted }})
    </button>
  </footer>
`

export const factory = () => ({
  update,
  middleware,
  subscribe,
  state,
  getState,
})
