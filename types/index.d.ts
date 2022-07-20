export = synergy
export as namespace synergy
declare namespace synergy {
  function define(
    /**
     * The name for the new custom element. As per the Custom Element spec,
     * the name must include a hyphen.
     */
    name: string,
    /**
     * A factory function that will be called whenever a new instance of your
     * custom element is created. Returns the object that will provide the data for your custom element.
     */
    factory: ModelFactory,
    /**
     * The template represents the HTML markup for your element.
     */
    template: HTMLTemplateElement | string
  ): void

  type State = {
    [key: string]: any
  }

  type ActionInput = {
    type: string
    payload: {
      [key: string]: any
    }
  }

  type Action = {
    type: string
    payload: {
      [key: string]: any
    }
    event: Event
    /*
     * The current state including any scoped values created by repeated blocks within the template
     */
    scope: {
      [key: string]: any
    }
  }

  type ActionHandler = {
    (currentState: State, action: Action): State
  }

  type Store = {
    getState(): State
    dispatch(action: ActionInput): void
  }

  type Derivation = {
    /**
     * A function that is passed the current state and returns the value of the property to which the function is assigned
     */
    (state: State): any
  }

  type Next = {
    /**
     * Passes the action to the next handler in the stack
     */
    (action: ActionInput): void
  }

  type Middleware = {
    /**
     * A function that intercepts an action before it reaches its ActionHandler (if any),
     * providing the opportunity to execute side effect(s), make asynchronous calls, re-route actions
     * , dispatch new actions, etc
     */
    (action: ActionInput, next: Next, store: Store)
  }

  type Model = {
    /**
     * Provides the initial state to the component for its very first render.
     */
    state?: State
    /**
     * Invoked each time the custom element is appended into a
     * document-connected element
     */
    connectedCallback?(store: Store): void
    /**
     * Invoked each time the custom element is disconnected from the document
     */
    disconnectedCallback?(): void
    /**
     *
     */
    update?: {
      [actionName: string]: ActionHandler
    }
    /**
     * Each property named here will be derived after each state update using its corresponding Derivation function.
     */
    derive?: {
      [propertyName]: Derivation
    }
    /**
     *  A debounced function that is called after every render cycle
     */
    subscribe?: {
      (state: State): void
    }
    /**
     *
     */
    middleware?: {
      [actionName: string]: Middleware | [Middleware]
    }
    /**
     * If this is omitted then Shadow DOM is not utilised and <slot> functionality is polyfilled.
     */
    shadow?: "open" | "closed"
  }

  type ModelFactory = {
    (
      /**
       * The Custom Element node
       */
      element: HTMLElement
    ): Model | Promise<Model>
  }
}
