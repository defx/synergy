---
description: 3.0.0
---

# Synergy

## Declarative

Express your UI simply in terms of data \(JS\) and templates \(HTML & CSS\) and Synergy will update your UI efficiently whenever your data changes.

## Component-driven

Build encapsulated and reusable custom elements and then compose them together to make complex UIs.

## Interoperable

Create standalone components that will work together with any other framework or library.

## A Simple Custom Element...

```javascript
<script type="module">
  import { define } from "https://unpkg.com/synergy";

  define(
    "hello-world",
    ({ name }) => ({
      name,
    }),
    "<p>Hello {{ name }}</p>"
  );
</script>
```

