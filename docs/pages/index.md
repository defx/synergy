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

  const name = "my-counter"

  const factory = () => ({
    state: { count: 0 },
    update: {
      increment: (state) => ({
        ...state,
        count: state.count + 1,
      }),
    },
  })

  define(name, factory, "#my-counter")
</script>

<template id="my-counter">
  <button :onclick="increment">Count is: {{ count }}</button>
</template>
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

</x-app>
