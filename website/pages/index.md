 <head>
  <title>Synergy - A JavaScript library for crafting user interfaces</title>
 </head>

## What is Synergy?

Synergy
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
        increment: ({ count }) => ({
          count: count + 1,
        }),
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

If you're new to Synergy then the best place to start is the _Learn by Example_ section. It will introduce you to all of the features of Synergy by showing different examples that will help you to understand and learn quickly.
