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

    if (type === "SET" || type === "MERGE") {
      updateState(systemReducer(getState(), action))
    } else {
      let mw = middleware[action.type]

      const done = (action) => {
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

      if (typeof mw === "function") {
        mw(action, done, {
          getState,
          dispatch,
          refs,
        })
      } else {
        done(action)
      }
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
