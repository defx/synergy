import { setValueAtPath } from "./helpers.js"

function systemReducer(state, action) {
  switch (action.type) {
    case "SET": {
      const { name, value } = action.payload

      let o = { ...state }
      setValueAtPath(name, value, o)

      return o
    }
    case "MERGE": {
      return {
        ...state,
        ...action.payload,
      }
    }
  }
}

export function configure({
  update = {},
  middleware = [],
  state: initialState = {},
  getState: getStateWrapper = (v) => v,
}) {
  let subscribers = []
  let state
  let updatedCallback = () => {}

  function updateState(o) {
    state = getStateWrapper({ ...o })
    updatedCallback()
  }

  updateState(initialState)

  const refs = {}

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

    if (type.startsWith("$")) {
      node.parentNode.dispatchEvent(
        new CustomEvent(type, {
          detail: action,
          bubbles: true,
        })
      )
    }

    if (type === "SET" || type === "MERGE") {
      updateState(systemReducer(getState(), action))
    } else {
      // let mw = middleware[action.type]

      // if (typeof mw === "function") {
      //   mw(action)
      // }

      /* 
      
      the current implementatiom supports being able to pass to another middleware with a different name, but is that something that we really need to support??
      
      */

      let next = (middleware) => (action) => {
        let mw = middleware[action.type]

        if (typeof mw === "function") {
          mw(
            action,
            next({
              ...middleware,
              [action.type]: null,
            }),
            {
              getState,
              dispatch,
              refs,
            }
          )
          return
        }

        if (action.type in update) {
          updateState(update[action.type](getState(), action))
        }

        return {
          then: (fn) =>
            new Promise((resolve) => {
              subscribe(() => {
                fn()
                resolve()
              })
            }),
        }
      }

      next(middleware)(action)
    }
  }

  return {
    dispatch,
    getState,
    onUpdate,
    flush,
    refs,
  }
}
