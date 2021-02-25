# Templates

Synergy's main purpose is _data binding_; taking your HTML template and replacing the "tokens" inside it with data from your JavaScript object, then updating your UI whenever that data changes.

In a Synergy template, a **token** is identified by surrounding it with double curly braces.

### Text

Let's take a look at how token replacement works with some simple text.

View:

```javascript
{
  name: "Ericka";
}
```

Template:

```markup
<p>hello {{ name }}!</p>
```

Output:

```markup
<p>hello Ericka!</p>
```

### Attributes

You can use tokens in the same way for both text and attribute nodes.

View:

```javascript
{
  textColor: 'gold',
};
```

Template:

```markup
<p style="color: {{ textColor }}">ok</p>
```

Output:

```markup
<p style="color: gold;">ok</p>
```

### Boolean attributes

Some HTML attributes are known as boolean attributes, which means that they're considered to be _true_ if present, or _false_ if absent.

Boolean values can be toggled by binding to a boolean value.

View:

```javascript
{
  hidden: true;
}
```

Template:

```markup
<div hidden="{{ hidden }}"></div>
```

Output:

```markup
<div hidden></div>
```

### ARIA attributes

Some ARIA attributes accept the string values "true" and "false". These aren't boolean attributes, but Synergy let's you bind to booleans and it will treat them accordingly.

View:

```javascript
{
  title: "more information";
  expanded: false;
}
```

Template:

```markup
<button aria-expanded="{{ expanded }}">
  {{ title }}
</button>
<div hidden="{{ !expanded }}"></div>
```

Output:

```markup
<button aria-expanded="false">
  {{ title }}
</button>
<div hidden></div>
```

### Logical NOT \(!\)

As per the example above, you can prefix boolean properties with the exclamation mark to convert a truthy value to a falsy value, and vice versa.

View:

```javascript
{
  authenticated: true;
}
```

Template:

```markup
<div hidden="{{ authenticated }}">
  Log in
</div>
<div hidden="{{ !authenticated }}">
  Log out
</div>
```

Output:

```markup
<span hidden>Log in</span
><span>Log out</span>
```

