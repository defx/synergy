export = synergy;
export as namespace synergy;
declare namespace synergy {
  interface Hooks {
    connectedCallback?: (f: (currentState: Model) => void) => void;
    updatedCallback?: (
      f: (currentState: Model, previousState: Model) => void
    ) => void;
    disconnectedCallback?: (f: (currentState: Model) => void) => void;
    adoptedCallback?: (f: (currentState: Model) => void) => void;
  }

  type Model = {
    [x: string]: any;
  };

  type ModelFactory = {
    (initialAttributes: { [x: string]: string | boolean }): Model;
  };

  function define(
    name: string,
    factory: ModelFactory,
    template: HTMLTemplateElement | string,
    options: {
      observedAttributes?: Array<string>; // now includes props...
      shadowRoot?: "open" | "closed";
      hooks?: Hooks;
    }
  ): void;

  function render(
    mountNode: Node,
    model: Model,
    template: HTMLTemplateElement | string,
    options: {
      hooks?: Hooks;
    }
  ): Model;
}
