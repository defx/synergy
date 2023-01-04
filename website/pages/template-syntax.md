<head>
  <title>Template Syntax | Synergy JS</title>
</head>

# Template syntax

Synergy uses an HTML-based template syntax that allows you to
declaratively add data and event bindings to your components HTML. All
synergy templates are syntactically valid HTML that can be parsed by
spec-compliant browsers and HTML parsers.

## Text

Let's take a look at how text interpolation works with a simple example.

State:

```js
{
  name: "Kimberley"
}
```

Template:

```html
<p>Hello {{ name }}!</p>
```

Output:

```html
<p>Hello Kimberley!</p>
```

## Attributes

Attribute bindings are always prefixed with the colon mark (`:`).

State:

```js
{
  cx: ["pt-6", "space-y-4"],
}
```

Template:

```html
<p id="foo" :class="cx">ok</p>
```

Output:

```html
<p id="foo" class="pt-6 space-y-4">ok</p>
```

## Attribute interpolation

When you need more than just a single state value you can use the mustache syntax for interpolation:

State:

```js
{
  textColor: 'gold',
}
```

Template:

```html
<p :style="color: {{ textColor }}">ok</p>
```

Output:

```html
<p style="color: gold;">ok</p>
```

## Shorthand attributes

When you bind an attribute to a property with the same name then you can use the shorthand notation:

State:

```js
{
  width: "100%",
  height: "100%",
  fill: "black"
}
```

Template:

```html
<rect :width :height :fill />
```

Output:

```html
<rect width="100%" height="100%" fill="black" />
```

## Boolean attributes

This is how we refer to any attribute bound to a boolean state property. It will be present on the bound element only when the value of the property is truthy.

State:

```js
{
  open: true
  closed: false
}
```

Template:

```html
<section :open :closed></section>
```

Output:

```html
<section open></section>
```

## ARIA attributes

One exception to Boolean Attributes are attributes prefixed with "aria-", these particular attributes will be set to the "true" of "false" string values as per their specification.

State:

```js
{
  title: "more information",
  expanded: false
}
```

Template:

```html
<button :aria-expanded="expanded">{{ title }}</button>
<div :hidden="!expanded"></div>
```

Output:

```html
<button aria-expanded="false">{{ title }}</button>
<div hidden></div>
```

## Logical NOT (!)

As per the examples above, you can prefix boolean properties with an exclamation mark to convert a truthy value to a falsy value, and vice versa.

State:

```js
{
  authenticated: true
}
```

Template:

```html
<div :hidden="authenticated">Log in</div>
<div :hidden="!authenticated">Log out</div>
```

Output:

```html
<button hidden>Log in</button>

<button>Log out</button>
```

## Conditional rendering

You can also conditionally render an element and its subtree using the `:if` binding with a boolean state property.

State:

```js
{
  authenticated: true
}
```

Template:

```html
<button :if="authenticated">Log out</button>
<button :if="!authenticated">Log in</button>
```

Output:

```html
<button>Log out</button>
```
