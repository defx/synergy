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

## Getting started

If you're new to Synergy then the best place to start is the Learn by Example section. It will introduce you to all of the features of Synergy by showing different examples that will help you to understand and learn quickly. Once you've worked your way through the examples there is also a Reference section for you to dip into whenever you need to quickly look up any particular detail.

</x-app>
