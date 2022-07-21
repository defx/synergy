 <x-app>
      <x-hero></x-hero>

# What is Synergy?

Synergy is a JavaScript framework for building user interfaces. It
combines declarative data and event binding with functional state
management and reactive updates to allow you to build all types of
user interface for the web, no matter how simple or complex.

Here's a simple example:

<my-counter></my-counter>

```html
<my-counter></my-counter>

<script type="module">
  import { define } from "https://unpkg.com/synergy@8.0.0"

  define(
    "my-counter",
    () => ({
      state: { count: 0 },
      update: {
        increment: (state) => ({
          ...state,
          count: state.count + 1,
        }),
      },
    }),
    `<button :onclick="increment">Count is: {{ count }}</button>`
  )
</script>
```

The above example demonstrates the three core features of Synergy:

- **Declarative data and event binding:** Synergy
  provides a declarative template syntax that allows you to describe
  HTML output based on JavaScript state. The syntax is very simple
  and easy to learn.
- **Functional state management:** Synergy allows you
  to describe changes to state as individual functions that are as
  easy to reason about as they are to test.
- **Reactive updates:** Synergy efficiently batches
  updates to your HTML whenever your state changes

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

</x-app>
