<head>
  <title>Learn by example - Simple Clock | Synergy JS</title>
</head>

# simple-clock

<simple-clock></simple-clock>

In this example we're going to create a custom element that displays the current time. We need a way to setup a scheduled event once the element is mounted to the DOM, and we will also need a way to programatically update state whenever that event fires to keep our time value synchronised with the real world.

`connectedCallback` is a lifecycle event that fires whenever the element is connected to the DOM...

```js
const factory = () => {
  return {
    update: {
      setTime: (state) => {
        return {
          ...state,
          time: new Date().toLocaleTimeString(),
        }
      },
    },
    connectedCallback: ({ dispatch }) => {
      setInterval(() => {
        dispatch({
          type: "setTime",
        })
      }, 100)
    },
  }
}
```

```html
<p>Time: {{ time }}</p>
```

In order to _programatically_ update state we can use the `dispatch` function provided within the first argument to `connectedCallback`. The `dispatch` function accepts a single argument which is an object that must include a `type` property to identify the update function that we want to call.

## disconnectedCallback

Of course, our element can be removed from the DOM at some later point, and we wouldn't want it to carry on scheduling re-renders in the background if there was nobody there to see it. So let's improve our `simple-clock` element to use the
`disconnectedCallback` to clear our timer interval.

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
