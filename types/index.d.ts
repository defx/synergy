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
    template: HTMLTemplateElement | string,
    /**
     * CSS for your Custom Element will be partially scoped by prefixing selectors with the elements name to stop your styles from leaking out, whilst still allowing inheritance of more generic global styles. CSS will be copied once into the document head and shared between all instances of the Custom Element.
     */
    css?: string
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
     * The current state including the variable scope of the event origin (i.e., created with a Repeated Block)
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

  type PromiseLike = {
    /**
     *
     * Returns a Promise that will be resolved after the next UI update
     */
    then(fn: Function): Promise
  }

  type Next = {
    /**
     * Passes the action to the next handler in the stack
     */
    (action: ActionInput): PromiseLike
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
     * A custom wrapper around calls to getState, giving you the ability to derive additional properties
     */
    getState?(state: State): State
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
