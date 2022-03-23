function systemReducer(state, action) {
  switch (action.type) {
    case "SET": {
      const { name, value } = action.payload
      return {
        ...state,
        [name]: value,
      }
    }
    case "MERGE": {
      return {
        ...state,
        ...action.payload,
      }
    }
  }
}

/*

Notes

  - any call to dispatch will immediately invoke the reducer
  - any call to dispatch within middleware is also immediately processed
  - SET and MERGE are not interceptable by middleware
  - middleware functions are assumed to call next synchronously
  - the render function (subscriber) is invoked once for every call to dispatch
  - the render function is debounced

*/

export function configure(userReducer, middleware = []) {
  let subscribers = []
  let state = userReducer(undefined, {})
  let update = () => {}

  function getState() {
    return { ...state }
  }

  function subscribe(fn) {
    subscribers.push(fn)
  }

  function flush() {
    subscribers.forEach((fn) => fn())
    subscribers = []
  }

  function onUpdate(fn) {
    update = fn
  }

  function dispatch(action) {
    if (action.type === "SET" || action.type === "MERGE") {
      state = systemReducer(state, action)
    } else {
      if (middleware.length) {
        let [first, ...rest] = middleware.concat(
          (action) => (state = userReducer(getState(), action))
        )
        rest.reduce(
          (a, b) => (action) =>
            a(action, b, { getState, dispatch, afterNextRender: subscribe }),
          first
        )(action)
      } else {
        state = userReducer(state, action)
      }
    }
    update()
  }

  return {
    dispatch,
    getState,
    onUpdate,
    flush,
  }
}
