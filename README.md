# synergy

## [![npm](https://img.shields.io/npm/v/synergy.svg)](http://npm.im/synergy) [![Build Status](https://travis-ci.com/defx/synergy.svg?branch=master)](https://travis-ci.com/defx/synergy) [![Coverage Status](https://coveralls.io/repos/github/defx/synergy/badge.svg?branch=master)](https://coveralls.io/github/defx/synergy?branch=master) [![gzip size](https://img.badgesize.io/https://unpkg.com/synergy/dist/synergy.min.js?compression=gzip&label=gzip)]()

Simple and declarative data binding for the DOM.

## Table of Contents

- [Features](#features)
- [Browser Support](#browser-support)
- [Install](#install)
- [Render](#render)
- [Template Syntax](#template-syntax)
  - [Logical NOT](#logical-not)
  - [Attributes](#attributes)
  - [Getters](#getters)
- [Repeated Blocks](#repeated-blocks)
- [Keyed Arrays](#keyed-arrays)
- [Events](#events)
- [Forms](#forms)
  - [Submitting Form Data](#submitting-form-data)
  - [Select](#select)
  - [Radio](#radio)
- [Side Effects](#side-effects)
- [Pre-rendering](#pre-rendering)

## Features

- Simple and declarative way to bind data, events, and markup
- Small footprint (~3.6k)
- No special tooling required (e.g., compilers, plugins)
- Minimal learning curve (almost entirely standard HTML, JS, and CSS!)

## Browser Support

Works in any [modern browser](https://caniuse.com/mdn-javascript_builtins_proxy_proxy) that supports JavaScript Proxy.

## Install

Using npm:

```bash
$ npm i synergy
```

Using unpkg CDN:

```
<script type="module">
  import synergy from 'https://unpkg.com/synergy';
</script>
```

## Render

The `render()` method combines an HTML template with a JavaScript object and then mounts the rendered HTML into an existing DOM node.

### Syntax

```js
let view = synergy.render(targetNode, viewmodel, template);
```

### Parameters

- `targetNode` An existing HTML element node where the rendered HTML should be mounted.

- `viewmodel` A plain JavaScript object that contains the data for your view.

- `template` Either an HTML string or a `<template>` node.

### Return value

A proxied version of your JavaScript object that will automatically update the UI whenever any of its values change

```js
let view = synergy.render(
  document.getElementById('app'),
  { message: 'Hello World!' },
  `<p>{{ message }}</p>`
);

view.message = '¡Hola Mundo!';
```

In the example above, we initialise the view with a paragraph that reads "Hello World!". We then change the value of message to '¡Hola Mundo!' and Synergy updates the DOM automatically.

## Template syntax {{ ... }}

Use the double curly braces to bind named properties from your JavaScript object to text or attribute values within your HTML template.

```html
<p style="background-color: {{ bgColor }}">{{ message }}</p>
```

As far as text nodes are concerned, the values you bind to them should always be primitives, and will always be cast to strings unless the value is `null` or `undefined`, in which case the text node will be empty.

Attributes, on the other hand, support binding to different data types in order to achieve different goals...

### Attributes and arrays

Some attributes accepts multiple values. The most common example of this is the `class` attribute.

You can bind multiple values to an attribute with an array.

```js
{
  classes: ['bg-white', 'rounded', 'p-6'];
}
```

```html
<section class="{{ classes }}">
  <!-- class="bg-white rounded p-6" -->
</section>
```

### Boolean attributes

Some content attributes (e.g. `required`, `readonly`, `disabled`) are called boolean attributes. If a boolean attribute is present, its value is true, and if it’s absent, its value is false. You can bind these attributes to a boolean value and Synergy will add or remove the attribute accordingly.

### ARIA attributes

Some ARIA attributes (e.g., `aria-expanded`, `aria-hidden`, `aria-invalid`) accept "true" or "false" as string values. You can also bind these attributes to boolean values and Synergy will cast them to strings.

### Inline styles

The style attribute is a special case and handled slightly differently to other attributes. As well as a regular string binding, you can also bind this attribute to an object representing a dictionary of CSS properties and values.

```js
{
  goldenBox: {
    backgroundColor: 'gold',
    width: '100px',
    height: '100px'
  }
}
// -> "background-color: gold; width: 100px; height: 100px;"
```

## Getters

Define any property as a standard JavaScript [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) in order to derive a value from _other_ values within your viewmodel.

```js
{
  width: 100,
  height: 100,
  get styles() {
    return {
      backgroundColor: 'gold',
      color: 'tomato',
      width: this.width + 'px',
      height: this.height + 'px',
    }
  }
}
```

```html
<section style="{{ styles }}"><!-- ... --></section>
```

## JavaScript expressions

Synergy doesn't allow you to write arbitrary JavaScript expressions inside your templates. This helps to keep a clearer separation of concerns between your JavaScript and your HTML. That being said, there are a couple of simple expressions that are supported to make working with attributes a little easier...

### Logical Not ( ! )

You can prefix a property name with an exclamation mark in order to negate it.

```html
<h3>
  <button id="{{ id }}" aria-expanded="{{ expanded }}">{{ title }}</button>
</h3>
<div aria-labelledby="{{ id }}" hidden="{{ !expanded }}">
  <!-- ... -->
</div>
```

### Object Spread ( ... )

You can prefix a property name with an ellipsis to spread all of the keys and values of an object onto an element as individual attributes.

```js
      {
        slider: {
          name: 'slider',
          type: 'range',
          min: '0',
          max: '360',
        },
      }
```

```html
<input {{...slider}} />
```

## Repeated blocks

Repeat a block of HTML for each item in an Array or Set by
surrounding it with the `each` opening (`#`) and closing (`/`) comments.

```js
{
  names: ['kate', 'kevin', 'randall'];
}
```

```html
<ul>
  <!-- #each name in names -->
  <li>Hello {{ name }}</li>
  <!-- /each -->
</ul>
```

Access the current index with the dot character

```html
<ul>
  <!-- #each todo in todos -->
  <li>
    <p>todo {{ . }} of {{ todos.length }}</p>
  </li>
  <!-- /each -->
</ul>
```

Repeated blocks can have multiple top-level nodes

```html
<!-- #each drawer in accordion.drawers -->
<h3>
  <button id="{{ id }}" aria-expanded="{{ expanded }}">{{ title }}</button>
</h3>
<div aria-labelledby="{{ id }}" hidden="{{ !expanded }}">
  <!-- ... -->
</div>
<!-- /each -->
```

### Keyed Arrays

Keys help Synergy identify which items in an Array have changed. Using keys improves performance and avoids unexpected behaviour when re-rendering.

The key can be any primitive value, as long as it is unique to that item within the Array.

By default, if the Array item is an object, then Synergy will look for an `id` property and assume that to be the key if you haven't said otherwise.

Set the `key` parameter if you need to override the default behaviour...

```html
<ul>
  <!-- #each person in people (key=whatever) -->
  <li>Hello {{ person.name }}</li>
  <!-- /each -->
</ul>
```

> Note that `#each` works the same for both Arrays and Sets.

## Events

Use standard DOM Event names to bind directly to named methods on your data.

```js
{
  sayHello: function() {
    alert("hi!");
  }
};
```

```html
<button onclick="sayHello">Say hello</button>
```

The first argument to your event handler is always a native DOM Event object

```js
{
  handleClick: function(event) {
    event.preventDefault();
    console.log("the link was clicked");
  }
};
```

If the target of the event is within a repeated block, then the second argument to your handler will be the datum for that particular item.

```js
{
  todos: [
    /* ... */
  ],
  todoClicked: function(event, todo) {
    /*... */
  };
}
```

```html
<ul>
  <!-- #each todo in todos -->
  <li>
    <h3 onclick="todoClicked">{{ todo.title }}</h3>
  </li>
  <!-- /each -->
</ul>
```

## Forms

Named inputs are automatically bound to properties of the same name on your data.

```html
<input name="color" type="color" />
```

```js
{
  color: '#4287f5';
}
```

### Submitting Form Data

By default, a HTML form will browse to a new page when the user submits the form. Submission happens when the user actives either a) an input[type="submit"], or b) a button[type="submit"].

> In some browsers, a button _without_ a [type] will be assumed to be [type="submit"] if it resides within a form element, so you should _always_ set a buttons `type` attribute when it lives within a form.

If you wish to override the browsers default behaviour, perhaps to execute some JavaScript before submitting the form data, then you would do that by binding to the forms submit event, and calling `preventDefault` on the event object inside your handler function to stop the browser from submitting the form.

```html
<form onsubmit="handleForm">
  <input name="formData.name" />
  <input name="formData.email" type="email" />
  <input type="submit" value="Submit" />
</form>
```

```js
{
  formData: {},
  handleForm: function(event) {
    console.log(this.formData);
    event.preventDefault();
  }
};
```

### Select

Simply name the `<select>`...

```html
<label for="pet-select">Choose a pet:</label>
<select name="pets" id="pet-select">
  <option value="">--Please choose an option--</option>
  <option value="dog">Dog</option>
  <option value="cat">Cat</option>
  <option value="hamster">Hamster</option>
  <option value="parrot">Parrot</option>
  <option value="spider">Spider</option>
  <option value="goldfish">Goldfish</option>
</select>
```

...and the value of the property will reflect the value of the currently selected `<option>`:

```js
{
  pets: 'hamster';
}
```

The standard HTML `<select>` element also supports the ability to select multiple options, using the **multiple** attribute:

```html
<select name="pets" id="pet-select" multiple></select>
```

A `<select>` with `[multiple]` binds to an Array on your data:

```js
{
  pets: ['hamster', 'spider'];
}
```

### Radio

Add a name to each radio button to indicate which _group_ it belongs to.

```html
<input type="radio" name="filter" value="all" id="filter.all" />
<input type="radio" name="filter" value="active" id="filter.active" />
<input type="radio" name="filter" value="complete" id="filter.complete" />
```

As with `<select>`, the value of the named property will reflect the value of the selected `<input type="radio">`.

```js
{
  filter: 'active';
}
```

## Side Effects

### propertyChangedCallback

You can implement a `propertyChangedCallback` method on your object to trigger side effects whenever there are changes to values on your object.

```js
{
  todos: [],
  propertyChangedCallback(path) {
    if (path.match(/^todos.?/)) {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    }
  }
}
```

> Invocations of `propertyChangedCallback` are already debounced with [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame), so you'll only get one invocation per property _per_ animation frame.

## Pre-rendering

Pre-rendering is useful when you need to get content rendered immediately as part of the initial page load, without having to wait for JavaScript to build the page first.

Synergy supports pre-rendering and hydration and doesn't care where or how you pre-render your content. In order to pre-render your page, you only need to load it in a browser (or with a synthetic DOM environment). That's it! Load the same page again in the browser and Synergy will hydrate the bindings without modifying the DOM.
