<head>
  <title>Learn by example - My Counter | Synergy JS</title>
</head>

# my-counter

<my-counter></my-counter>

A key feature of any user interface is the ability to update its state in response to different events. In Synergy, this process is defined by the object returned from your custom elements factory function.

Lets take another look at the `my-counter` example from the home page:

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

In the example above, the returned object includes both the `state` and `update` properties.

## State

`State` is an object that provides the _initial_ data for your custom element. Any properties defined here can be used directly in the template via text or attribute bindings, which is exactly how the value of `count` is included inside the template using text interpolation:

```html
<button :onclick="increment">Count is: {{ count }}</button>
```

## Update

`Update` is a dictionary of named state update functions that can be referenced directly in the template as event handlers, as per the `:onclick="increment"` binding in the example above.

Each state update function takes the _current_ state as its first argument and returns the _next_ state for the custom element.
