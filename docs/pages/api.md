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

</x-app>
