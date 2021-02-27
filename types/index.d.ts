export = synergy;
export as namespace synergy;
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
    options: {
      /**
       * An array of attribute or property names that you would like your element to react to changes for.
       */
      observe?: Array<string>;
      /**
       * If this is omitted then Shadow DOM is not utilised and <slot> functionality is polyfilled.
       */
      shadow?: 'open' | 'closed';
      /**
       * An object containing one or more lifecycle callbacks.
       */
      lifecycle?: LifecycleCallbacks;
    }
  ): void;

  function render(
    /**
     * An existing DOM element node to which the rendered HTML should be appended
     */
    mountNode: Node,
    /**
     * A plain JavaScript object that contains the data for your view
     */
    model: Model,
    /**
     * The template represents the HTML markup for your view
     */
    template: HTMLTemplateElement | string,
    options: {
      /**
       * An object containing one or more lifecycle callbacks.
       */
      lifecycle?: LifecycleCallbacks;
    }
  ): Model;

  type Model = {
    [x: string]: any;
  };

  type ModelFactory = {
    (
      /**
       * An object containing the initial attribute key/value pairs from the element.
       */
      initialAttributes: { [x: string]: string | boolean },
      /**
       * The element node
       */
      element: HTMLElement
    ): Model;
  };

  interface LifecycleCallbacks {
    /**
     * Invoked each time the custom element is appended into a
     * document-connected element
     */
    connectedCallback?: (f: (currentState: Model) => void) => void;
    /**
     * Invoked each time the view is updated. This method is not called after the initial render. previousState is an (non-reactive) object representing the model state prior to the last update
     */
    updatedCallback?: (
      f: (currentState: Model, previousState: Model) => void
    ) => void;
    /**
     * Invoked each time the custom element is disconnected from the DOM
     */
    disconnectedCallback?: (f: (currentState: Model) => void) => void;
    /**
     * Invoked each time the custom element is moved into a new document
     */
    adoptedCallback?: (f: (currentState: Model) => void) => void;
  }
}
