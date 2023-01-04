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
   * A custom wrapper around calls to getState, giving you the ability to define derived properties, for example
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
```

## High-level view

The Synergy `define` function allows you to register a custom element on the page. Once defined, you can use your custom element like any other HTML tag.

The `define` function takes up to four arguments:

- `tagName` (required) [string] - Name for the new Custom Element. As per the Custom Element
  spec, an elements name must include a hyphen to differentiate from standard built-in elements.

- `factory` (required) [function] - A factory function that will be called whenever a new instance of your Custom Element is created. It will be provided with one argument which is the Custom Element node itself. The factory function returns an Object (or a Promise that resolves to an Object) that defines the behaviour of the element.

- `template` (required) [HTMLTemplateElement | string] - The HTML for your view.

- `styles` (optional) [string] - The CSS for your custom element. The CSS will be transformed to apply lightweight scoping before being added to the head of the document.

As you can see, the first, third, and fourth arguments are just strings. The third argument is standard HTML, and the fourth argument is standard CSS. One of the great things about Synergy is that it allows you to build UI using 100% standard, spec-compliant HTML, CSS, and JavaScript.

In the next section we will look closer at our simple element example to understand more about how Synergys reactivity system works and what you can do with it.
