<x-app>

# API

## Define

Synergy's `define` function allows you to create a new HTML element. Once defined within an HTML document your custom element can be used on the page just like any other HTML tag. Your custom elements can be composed together, allowing you to build anything from a simple component to an entire website or application.

The `define()` function registers a new Custom Element.

### Syntax

```js
define(tagName, factory, template, styles)
```

### Parameters

- `tagName` (required) [string] - Name for the new Custom Element. As per the Custom Element
  spec, an elements name must include a hyphen to differentiate from standard built-in elements.

- `factory` (required) [function] - A factory function that will be called whenever a new instance of your Custom Element is created. It will be provided with one argument which is the Custom Element node itself. The factory function returns a Model (see below) or a Promise that resolves to a Model.

- `template` (required) [HTMLTemplateElement | string] - The HTML for your view.

- `styles` (optional) [string] - The CSS for your custom element. The CSS will be transformed to apply lightweight scoping before being added to the head of the document.

### Return value

None (`undefined`)

## Model

The factory function provided as the second argument to `define` must return a plain JavaScript object that represents the element _Model_.

```ts
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
```

</x-app>
