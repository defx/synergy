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

function unique(arr) {
  return [...new Set(arr)]
}

export function configure(
  {
    update = {},
    middleware = [],
    state: initialState = {},
    getState: getStateWrapper = (v) => v,
  },
  node
) {
  let subscribers = []
  let state
  let updatedCallback = () => {}

  let dollarKeys = unique(
    Object.keys(update)
      .concat(Object.keys(middleware))
      .filter((v) => v.startsWith("$"))
  )

  function updateState(o) {
    state = getStateWrapper({ ...o })
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
            }
          )
          return
        }

        if (action.type in update) {
          updateState(update[action.type](getState(), action))
          updatedCallback()
        }

        // { then } returns a Promise that will resolve after the next update
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

    updatedCallback()
  }

  for (let actionName of dollarKeys) {
    node.addEventListener(actionName, ({ detail }) => {
      dispatch(detail)
    })
  }

  return {
    dispatch,
    getState,
    onUpdate,
    flush,
  }
}
