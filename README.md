# synergy

## [![npm](https://img.shields.io/npm/v/synergy.svg)](http://npm.im/synergy) [![Build Status](https://travis-ci.com/defx/synergy.svg?branch=master)](https://travis-ci.com/defx/synergy) [![Coverage Status](https://coveralls.io/repos/github/defx/synergy/badge.svg?branch=master)](https://coveralls.io/github/defx/synergy?branch=master) [![gzip size](https://img.badgesize.io/https://unpkg.com/synergy/dist/synergy.min.js?compression=gzip&label=gzip)]()

Declarative data and event binding for the DOM.

## Table of Contents

- [Features](#features)
- [Use Cases](#use-cases)
- [Browser Support](#browser-support)
- [Install](#install)
- [API](#api)
- [Data Binding](#data-binding)
  - [Attributes](#attributes)
  - [Getters](#getters)
- [Lists](#lists)
- [Events](#events)
  - [List Events](#list-events)
  - [Keyed Lists](#keyed-lists)
- [Forms](#forms)
  - [Submitting Form Data](#submitting-form-data)
  - [Select](#select)
  - [Radio](#radio)
- [Pre-rendering](#pre-rendering)

## Features

- Simple and declarative way to bind data, events, and markup
- Small footprint (~3.5k)
- No special tooling required (e.g., compilers, plugins)
- Minimal learning curve (almost entirely standard HTML, JS, and CSS!)

## Use Cases

- partially and/or progressively enhance server rendered pages
- use together with Custom Elements for a component-based workflow
- build reactive, data-intensive browser-based applications
- rapid browser-based prototyping

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

## API

Render into an existing element inside the document:

```js
synergy.render(
  document.getElementById('container'),
  { message: 'Hello World!' },
  '<p>{{ message }}</p>'
);
```

The `render` method returns a proxied version of your JavaScript object that will automatically update the UI whenever any of its values change

```js
const view = synergy.render(/*...*/);

view.message = '¡Hola Mundo!';
```

## Data binding {{...}}

Use the double curly braces to bind named properties from your JavaScript object to text or attributes within your HTML template.

```html
<p style="background-color: {{ bgColor }}">{{ message }}</p>
```

> Unlike many other libraries and frameworks, Synergy only supports the binding of named properties, and not JavaScript expressions. This helps to ensure a clear separation of concerns between your HTML template and your JavaScript object.

### Attributes

If a bound property is an Array, then all of its values will be joined together, each separated by a space.

```js
{
  className: ['bg-white', 'rounded', 'p-6'];
}
```

```html
<section class="{{ className }}">
  <!-- class="bg-white rounded p-6" -->
</section>
```

If a bound property is a plain object, then each key with a corresponding [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) value will be joined together, each separated by a space.

```js
{
  className: {
    'bg-white': true,
    'rounded': false,
    'p-6': true
  }
}
```

```html
<section class="{{ className }}">
  <!-- class="bg-white p-6" -->
</section>
```

You can also use the _spread_ syntax to apply multiple attributes to an element using a single object.

```js
      {
        slider: {
          name: 'slider',
          type: 'range',
          min: '0',
          max: '360',
          step: null,
        },
      }
```

```html
<input {{...slider}} />
```

### Style attribute

The [style] attribute is a special case and handled slightly differently to other attributes; If the bound property is a plain object, then keys will be converted from Pascal casing before keys and values are joined together, separated by semi-colons.

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

We can define any property as a standard JavaScript [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) when we want to derive the property value from _other_ property values on the object.

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

## Lists

Iterate using the **[each]** attribute

```js
{
  names: ['kate', 'kevin', 'randall'];
}
```

```html
<ul>
  <li each="name in names">Hello {{ name }}</li>
</ul>
```

Access the index using square bracket notation

```html
<ul>
  <li each="[index, todo] in todos">
    <p>todo {{ index }} of {{ todos.length }}</p>
  </li>
</ul>
```

### Keyed Lists

Keys help Synergy identify which items in a list have changed. Using keys improves performance and avoids unexpected behaviour when re-rendering lists.

The key can be any primitive value, as long as it is unique to that item within the collection.

By default, if the list item is an object, then Synergy will look for an `id` property and assume that to be the key if you haven't said otherwise.

If you want to override the default behaviour, then just use the [key] attribute....

```html
<ul>
  <li each="person in people" key="yourCustomKey">Hello {{ person.name }}</li>
</ul>
```

Note that **[each]** works the same with both Arrays and Sets.

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

### List Events

If the target of the event is a list element, then the second argument to your handler will be the data for that particular item.

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
  <li each="todo in todos">
    <h3 onclick="todoClicked">{{ todo.title }}</h3>
  </li>
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

As with any other binding, you can use dot notation to target nested properties.

```html
<input name="color.primary" />
```

### Submitting Form Data

By default, a HTML form will browse to a new page when the user submits the form. If you want to handle the submission of the form using JavaScript, then you would do that by binding to the forms submit event.

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

## Pre-rendering

Pre-rendering is useful when you need to get content rendered immediately as part of the initial page load, without having to wait for JavaScript to build the page first.

Synergy supports pre-rendering and hydration and doesn't care where or how you pre-render your content. Here's how it works...

When Synergy is ready to mount to the DOM, it first checks to see if the target elements _existing_ HTML content matches what the content that is about to be rendered. If the two contents match _exactly_, then the existing DOM will be preserved, and the bindings will be transferred from the newly created (and yet unmounted) DOM across to the existing DOM. The newly created DOM is then left for the Garbage Collector, and the existing DOM is effectively _hydrated_ with all of its event and data bindings, thus becoming interactive.

It's important to understand that there's no difference between the code required to pre-render the view and the code required to hydrate the view. Pre-rendering and hydrating essentially involves running the same code twice, but saving the rendered HTML from the first run, and then serving that same HTML in the second run.
