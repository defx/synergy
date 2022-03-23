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
        let fns = middleware.slice()

        let next = (action) => {
          if (fns.length) {
            fns.shift()(action, next, {
              getState,
              dispatch,
              afterNextRender: subscribe,
            })
          } else {
            state = userReducer(getState(), action)
          }
        }

        fns.shift()(action, next)
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
