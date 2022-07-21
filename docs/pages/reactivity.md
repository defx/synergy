<x-app>

# The Custom Element Factory

A key feature of any user interface (UI) is the ability to update in response to user behaviour. A common way to think about UI is as a sequence of states. We begin in State A, then some event causes a transition to State B. In Synergy, this process is defined by the object returned from your custom elements factory function.

Lets take another look at the basic example from the home page:

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

## connectedCallback

`connectedCallback` is a _lifecycle_ event that fires whenever the element is connected to the DOM. This allows you to run any setup code that needs to happen when the element is first initialised.

Let's build another simple example component to see how that works...

<simple-clock></simple-clock>

```js
const factory = () => {
  return {
    update: {
      setTime: (state, { payload }) => {
        return {
          ...state,
          time: payload,
        }
      },
    },
    connectedCallback: ({ dispatch }) => {
      setInterval(() => {
        dispatch({
          type: "setTime",
          payload: new Date().toLocaleTimeString(),
        })
      }, 100)
    },
  }
}
```

```html
<p>Time: {{ time }}</p>
```

In the above example we've created a `simple-clock` element that displays the current time. This is a great opportunity to use the `connectedCallback` so that we can schedule state updates to keep the time value synchronised with the real world.

Unlike our `my-counter` example, this time we need a way to _programatically_ update state, and the `dispatch` function provided within the first argument to `connectedCallback` serves exactly that purpose. The `dispatch` function accepts a single argument which is an object that must include a `type` property to identify the the update function that we want to call. We can also optionally add the `payload` property if we have some data that we wish to provide to our update function.

Of course, our element can be removed from the DOM at some later point, and we wouldn't want it to carry on scheduling re-renders in the background if there was nobody there to see it. So let's improve our `simple-clock` element to use
`disconnectedCallback` and clear our timer interval.

```js
const factory = () => {
  let intervalID

  return {
    update: {
      setTime: (state, { payload }) => {
        return {
          ...state,
          time: payload,
        }
      },
    },
    connectedCallback: ({ dispatch }) => {
      intervalID = setInterval(() => {
        dispatch({
          type: "setTime",
          payload: new Date().toLocaleTimeString(),
        })
      }, 100)
    },
    disconnectedCallback: () => {
      clearInterval(intervalID)
    },
  }
}
```
