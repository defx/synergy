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

export function configure(
  { update = {}, middleware = [], derivations = {}, initialState = {} },
  node
) {
  let subscribers = []
  let state
  let updatedCallback = () => {}

  function updateState(o) {
    state = { ...o }
    for (let k in derivations) {
      state[k] = derivations[k](o)
    }
  }

  updateState(initialState)

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
    updatedCallback = fn
  }

  function dispatch(action) {
    const { type } = action
    if (type === "SET" || type === "MERGE") {
      updateState(systemReducer(getState(), action))
    } else {
      if (middleware.length) {
        let mw = middleware.slice()

        let next = (action) => {
          if (mw.length) {
            let x = mw.shift()

            if (action.type in x) {
              x[action.type](action, next, {
                getState,
                dispatch,
                afterNextRender: subscribe,
              })
            } else {
              next(action)
            }
          } else if (action.type in update) {
            updateState(update[action.type](getState(), action))
          }
        }

        let x = mw.shift()

        if (type in x) {
          x[type](action, next, {
            getState,
            dispatch,
            afterNextRender: subscribe,
          })
        } else {
          next(action)
        }
      } else if (type in update) {
        updateState(update[type](getState(), action))
      }
    }
    updatedCallback()
  }

  for (let actionName in update) {
    if (actionName.startsWith("$")) {
      node.addEventListener(actionName, ({ detail }) => dispatch(detail))
    }
  }

  return {
    dispatch,
    getState,
    onUpdate,
    flush,
  }
}
