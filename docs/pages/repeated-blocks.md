<x-app>

# Repeated Blocks

Repeated blocks work with both Arrays and Objects.

Repeat a block of HTML for each item in a collection using a the `:each` attribute.

State:

```js
{
  names: ["kate", "kevin", "randall"]
}
```

Template:

```html
<ul>
  <li :each="name in names">Hello {{ name }}</li>
</ul>
```

## Iteration Keys

You can use parentheses to access the key as well as the value.

Template:

```html
<ul>
  <li :each="(index, todo) in todos">todo {{ index }} of {{ todos.length }}</li>
</ul>
```

## Implicit scope

Property access via the identifier is optional, you can also access directly like so...

State:

```js
{
  bars: [
    {
      x: 0,
      y: 0,
      width: 32,
      height: 16,
      fill: "hsl(100, 50%, 50%)",
    },
    {
      x: 0,
      y: 16,
      width: 64,
      height: 16,
      fill: "hsl(200, 50%, 50%)",
    },
    //...
  ]
}
```

Template:

```html
<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect :each="bars" :x :y :width :height :fill class="bar" />
</svg>
```

...when accessing properties in this way, Synergy will first check to see if the property is defined on the current item within the iteration, and will otherwise try the same property against the viewmodel itself.

## Multiple top-level nodes

If you need more than one top-level element then you can wrap your repeated block in a template like so:

State:

```js
{
  cryptids: [{
    title: "Beast of Bodmin",
    description: "A large feline inhabiting Bodmin Moor."
  },
  {
    title: "Morgawr",
    description: "A sea serpent."
  }
  {
    title: "Owlman",
    description: "A giant owl-like creature."
  }
]
}
```

Template:

```html
<dl>
  <template :each="cryptids">
    <dt>{{ title }}</dt>
    <dd>{{ description }}</dd>
  </template>
</dl>
```

...or in the case of SVG you can use `<defs>` instead of `<template>`.

## Keyed Arrays

Keys help Synergy identify which items in an collection of objects
have changed.

Using keys improves performance and
avoids unexpected behaviour when re-rendering so it's always best to use them.

List keys are specified using the `:key` attribute and should be a primitive value that is unique to that item within the collection.

```html
<ul>
  <li :each="person in people" :key="id">Hello {{ person.name }}</li>
</ul>
```

</x-app>
