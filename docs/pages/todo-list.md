<head>
  <title>Learn by example - Todo List | Synergy JS</title>
</head>
<x-app>

# todo-list

<todo-list></todo-list>

In this example we will learn some more features of Synergy by looking at how to create a simple todo list. Let's take a look at the code and then we talk about each section and how it works...

```js
const itemsLeft = ({ todos }) => {
  const n = todos.filter(({ completed }) => !completed).length
  return `${n} ${n === 1 ? "item" : "items"} left`
}

const factory = () => {
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
}
```

```html
<input
  :name="newTodo"
  :onkeyup="addTodo"
  placeholder="What needs to be done?"
/>
<ul>
  <li :each="todo in todos">
    <input type="checkbox" :name="todo.completed" />
    {{ todo.title }}
    <button :onclick="removeTodo">[x]</button>
  </li>
</ul>
<p>{{ itemsLeft }}</p>
```

## Two-way bindings (:name)

Using the `:name` binding on a form input automatically creates a special two-way binding. The input will assume the value (if there is one) from a state property of the same name (in this case `newTodo`), and whenever the value of the input changes, state will automatically be updated to reflect that change.

```html
<input
  :name="newTodo"
  :onkeyup="addTodo"
  placeholder="What needs to be done?"
/>
```

We've already seen in previous examples how to add event bindings, and we're adding another one here to the input element so that it will invoke the `addTodo` update function whenever the `keyup` event fires.

## Context { event }

We want to add a new todo item whenever the user presses the Enter key inside the input. The second argument to every state update function is the _context_ object which, if the update function was triggered by an event, includes an `event` key that points to the native <a href="https://developer.mozilla.org/en-US/docs/Web/API/Event" target="_blank">Event</a> object.

```js
const factory = () => {
    return {
      // ...
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
        // ...
    }
    // ...
}
```

In the example above, we use the Event object to check which key was pressed, and if it's _not_ the Enter key then we simply return the current state so that nothing changes. If it _was_ the Enter key, then our second condition checks that the `newTodo` input isn't empty before using its value to add the new todo to our list. When we add the new todo, we also set the value of `newTodo` to `null` so as to clear the input element ready for the next todo item to be added.

## Repeated blocks (:each)

A block of HTML can be repeated for each item in an array by using the `:each` binding.

```html
<li :each="todo in todos">
  <input type="checkbox" :name="todo.completed" />
  {{ todo.title }}
  <button :onclick="removeTodo">[x]</button>
</li>
```

The `todo in todos` expression creates a new value called `todo` that refers to the current item in the iteration.

## Context { scope }

When the button on one of our todo items is clicked, the `removeTodo` update function is invoked...

```js
const factory = () => {
    return {
      // ...
      update: {
        removeTodo: (state, { scope: { todo } }) => {
          return {
            ...state,
            todos: state.todos.filter(({ title }) => title !== todo.title),
          }
        },
        // ...
    }
    // ...
}
```

As we just learned, the second argument to every state update function is the _context_ object. If the update function was triggered inside a repeated block, then this object includes a `scope` key that points to an object containing all properties of the variable scope from where the event originated. In the example above, the scope object includes a `todo` property which holds the value of the same todo for which the button was pressed.
</x-app>
