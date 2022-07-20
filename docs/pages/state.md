<x-app>

# State

A custom elements state, and the functions for updating that state, are all configured as part of the Model that is return from your factory function. Lets take another look at the basic example from the home page.

### Factory

```js
const factory = () => ({
  state: { count: 0 },
  update: {
    increment: (state) => ({
      ...state,
      count: state.count + 1,
    }),
  })
```

In the example above, the Model includes both the `state` and `update` properties.

- `state` - An object that provides the _initial_ data for your custom element. Any properties defined here can be used directly in the template.

- `update` - An dictionary of named state update functions that can be referenced directly in the template as event handlers

### Template

```html
<button :onclick="increment">Count is: {{ count }}</button>
```

When the button receieves a click event, then the `increment` update function is invoked and passed the current state. The value returned from a state update function _replaces_ the current state. Whenever an elements state changes, its DOM is updated automatically to refelect that change.

  </x-app>
