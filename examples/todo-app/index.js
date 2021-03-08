export const storage = {
  get: (k) => JSON.parse(localStorage.getItem(k)),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

const html = (strings, ...values) => strings.reduce((a, v, i) => a + v + (values[i] || ''), '');

const filters = {
  all: (todos) => todos,
  active: (todos) => todos.filter(({ completed }) => !completed),
  done: (todos) => todos.filter(({ completed }) => completed),
};

const KEYS = {
  RETURN: 13,
  ESCAPE: 27,
};

export const lifecycle = {
  updatedCallback(curr) {
    storage.set('todos', curr.todos);
  },
};

export const TodoApp = () => {
  return {
    filters: Object.keys(filters),
    todos: [],
    activeFilter: 'all',
    addTodo(e) {
      if (!(e.key && e.key === 'Enter')) return;

      let title = this.newTodo && this.newTodo.trim();

      if (!title) return;
      this.todos.push({ title, id: Date.now() });
      this.newTodo = null;
    },
    startEdit(e, item) {
      this.todos = this.todos.map((todo) => {
        if (todo === item) {
          this.titleEdit = item.title;
        }

        return {
          ...todo,
          editing: todo === item,
        };
      });
      return () => {
        e.target.parentNode.querySelector('.edit').focus();
      };
    },
    saveEdit(item) {
      if (!item.editing) return;

      item.editing = false;
      let title = String(this.titleEdit);

      if (!title.trim()) {
        this.todos = this.todos.filter((todo) => {
          return todo !== item;
        });
      } else {
        item.title = title;
      }
    },
    deleteTodo(e, item) {
      this.todos.splice(this.todos.indexOf(item), 1);
    },
    get allDone() {
      return this.todos.every((todo) => todo.completed);
    },
    set allDone(completed) {
      this.todos = this.todos.map((todo) => ({
        ...todo,
        completed,
      }));
    },
    get filteredTodos() {
      return filters[this.activeFilter](this.todos);
    },
    get numCompleted() {
      return this.todos.filter(({ completed }) => completed).length;
    },
    removeCompleted() {
      this.todos = this.todos.filter(({ completed }) => !completed);
    },
    get itemsLeft() {
      const n = this.todos.filter(({ completed }) => !completed).length;
      return `${n} item${n === 1 ? '' : 's'} left`;
    },
    dispatchKeyDown(e, item) {
      switch (e.keyCode) {
        case KEYS.ESCAPE:
          item.editing = false;
          this.titleEdit = '';
          break;
        case KEYS.RETURN:
          this.saveEdit(item);
      }
    },
  };
};

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
      name="newTodo"
      onkeydown="e => addTodo(e)"
    />
  </header>
  <main hidden="{{ !todos.length }}">
    <label for="allDone">Mark all as complete</label>
    <input id="allDone" type="checkbox" name="allDone" />
    <ul>
      <template each="todo in filteredTodos">
        <li class="todo" is-done="{{todo.completed}}" editing="{{todo.editing}}" key="id">
          <input class="toggle" type="checkbox" name="todo.completed" />
          <label ondblclick="e => startEdit(e, todo)">{{todo.title}}</label>
          <input
            class="edit"
            name="titleEdit"
            onblur="saveEdit(todo)"
            onkeydown="e => dispatchKeyDown(e, todo)"
          />
          <button class="delete" onclick="deleteTodo()">[delete]</button>
        </li>
      </template>
    </ul>
  </main>
  <footer hidden="{{ !todos.length }}">
    <p id="count">{{ itemsLeft }}</p>
    <ul id="filterList">
      <template each="filter in filters">
        <li>
          <input type="radio" name="activeFilter" value="{{filter}}" />
          <label>{{ filter }}</label>
        </li>
      </template>
    </ul>
    <button id="clearCompleted" hidden="{{ !numCompleted }}" onclick="removeCompleted()">
      clear completed ({{ numCompleted }})
    </button>
  </footer>
`;
