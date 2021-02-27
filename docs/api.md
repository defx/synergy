# API

The high-level Synergy API is comprised of just two functions, \(`define` and `render`\). The `define` function is used to register new custom elements, the reusable blocks that you will use to build your user interface. The lower-level `render` function is used to bind directly to the DOM. It's used by `define` under the hood, and you may also find this function useful for rendering the main DOM tree that contains your custom elements.

In addition, the instances created by both `define` and `render` have a set of lifecycle events available for you to hook into with your own custom handler functions.

## define

The `define()` function registers a new Custom Element.

**Syntax**

```javascript
define(tagName, factory, template, options);
```

### **Parameters**

* `tagName` \(string\) - Name for the new custom element. As per the Custom Element spec, an elements name must include a hyphen.
* `factory` \(function\) - A factory function that will be called whenever a new instance of your custom element is created. It will be provided with two arguments: an object representing the elements initial attribute name/value pairs, and the element node itself. Returns a plain JavaScript object to provide the viewmodel for your custom element.
* `template` \(HTMLTemplateElement \| string\) - The HTML for your view.
* `options` \(object\) - The available options are:
  * `observe` \(string\[\]\) - An array containing the element attributes or properties that you want to observe.
  * `shadow` \(string\) - A string representing the shadow _mode_. Can be one of either "open" or "closed". If this option is omitted, then Shadow DOM is not used and `<slot>` functionality is polyfilled.
  * `lifecycle` \(object\) - An object containing one or more lifecycle hooks.

## render

The `render()` function combines an HTML template with a JavaScript object and then appends the rendered HTML to an existing DOM element node.

**Syntax**

```javascript
let view = render(
  element,
  viewmodel,
  template
);
```

### **Parameters**

* `element` \(HTMLElement\) - An existing DOM element node to which the rendered HTML should be appended.
* `viewmodel` \(object\) - A plain JavaScript object that provides the data and functionality for your view.
* `template` \(HTMLTemplateElement \| string\) - The HTML for your view.
* `options` \(object\) - The available options are:
  * `lifecycle` \(object\) - An object containing one or more lifecycle hooks.

### Return value

A proxied version of your viewmodel that will automatically update the UI whenever any of its values change

```javascript
let view = render(
  document.getElementById("app"),
  { message: "Hello World!" },
  `<p>{{ message }}</p>`
);

view.message = "¡Hola Mundo!";
```

In the example above, we initialise the view with a paragraph that reads "Hello World!". We then change the value of message to '¡Hola Mundo!' and Synergy updates the DOM automatically.

## Lifecycle Callbacks

This section lists all of the lifecycle callbacks that you can define.

```javascript
({
  connectedCallback() {
    /* Invoked each time the custom element is 
    appended into a document-connected element */
  },
  updatedCallback(prevState) {
    /* Invoked each time the viewmodel is 
    updated. This method is not called 
    after the initial render. prevState is 
    an object representing the state of 
    the viewmodel prior to the last update */
  },
  disconnectedCallback() {
    /* Invoked each time the custom 
    element is disconnected from the 
    DOM */
  },
  adoptedCallback() {
    /* Invoked each time the custom 
    element is moved to a new document */
  },
});
```

