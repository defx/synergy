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

- `template` Either an HTML string or a <template> node.

### Return value

A proxied version of your JavaScript object that will automatically update the UI whenever any of its values change

```js
let view = synergy.render(/*...*/);

view.message = '¡Hola Mundo!';
```

## Template Syntax

Use the double curly braces to bind named properties from your JavaScript object to text or attributes within your HTML template.

```html
<p style="background-color: {{ bgColor }}">{{ message }}</p>
```

> Unlike many other libraries and frameworks, Synergy templates _don't_ support arbitrary JavaScript expressions. This helps to ensure a clear separation of concerns between your HTML and JavaScript.

### Logical NOT

You can prefix the property name with the logical NOT operator (!) to flip a truthy value to `false`, or a falsy value to `true`

```html
<section hidden="{{ !expanded }}"></section>
```

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

Use the _spread_ syntax to apply multiple attributes to an element using a single object.

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

The [style] attribute is a special case and handled slightly differently to other attributes; If the bound property is a plain object, then keys will be converted from Pascal to Kebab case before keys and values are joined together, separated by semi-colons.

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

Define any property as a standard JavaScript [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) when you want to derive the property value from _other_ property values on your object.

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

## Repeated blocks

Repeat a block of HTML for each item in an Array or Set using the `#each` comment block

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
<h2>
  <button id="{{ id }}" aria-expanded="{{ expanded }}">{{ title }}</button>
</h2>
<section aria-labelledby="{{ id }}" hidden="{{ !expanded }}">
  <!-- ... -->
</section>
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

Note that `#each` works the same for Arrays and Sets.

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

As with any other binding, you can use dot notation to target nested properties.

```html
<input name="color.primary" />
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

Synergy supports pre-rendering and hydration and doesn't care where or how you pre-render your content. Here's how it works...

When Synergy is ready to mount to the DOM, it first checks to see if the target elements _existing_ HTML content matches what the content that is about to be rendered. If the two contents match _exactly_, then the existing DOM will be preserved, and the bindings will be transferred from the newly created (and yet unmounted) DOM across to the existing DOM. The newly created DOM is then left for the Garbage Collector, and the existing DOM is effectively _hydrated_ with all of its event and data bindings, thus becoming interactive.
