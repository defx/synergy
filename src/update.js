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

export function configure(userReducer) {
  let subscribers = []
  let state = userReducer(undefined, {})

  function getState() {
    return { ...state }
  }

  function dispatch(action) {
    if (action.type === "SET" || action.type === "MERGE") {
      state = systemReducer(state, action)
    } else {
      state = userReducer(state, action)
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
