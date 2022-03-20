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

export function configure(userReducer, middleware = []) {
  let subscribers = []
  let state = userReducer(undefined, {})

  function getState() {
    return { ...state }
  }

  function dispatch(action) {
    if (action.type === "SET" || action.type === "MERGE") {
      state = systemReducer(state, action)
    } else {
      if (middleware.length) {
        let [first, ...rest] = middleware.concat((action) =>
          userReducer(getState(), action)
        )
        rest.reduce(
          (a, b) => (action) => a(action, b, { getState, dispatch }),
          first
        )(action)
      } else {
        state = userReducer(state, action)
      }
    }
    // @todo: debounce this...
    subscribers.forEach((fn) => fn(getState()))
  }

  function subscribe(fn) {
    subscribers.push(fn)
  }

  return {
    dispatch,
    getState,
    subscribe,
  }
}
