 <x-app>

# Styles

## Multiple classes with Array

Model:

```js
{
  classes: ["w32", "h32", "rounded-full", "mx-auto"]
}
```

Template:

```html
<img :class="classes" />
```

Output:

```html
<img class="w32 h32 rounded-full mx-auto" />
```

## Conditional Classes with Object

Model:

```js
{
    classes: {
        'mx-auto': true,
        'has-error': false
    }
}
```

Template:

```html
<div :class="classes"></div>
```

Output:

```html
<div class="mx-auto"></div>
```

## Conditional Classes with Getter + Object

Model:

```js
{
    hasErrors: true,
    get classes() {
        return {
            errors: this.hasErrors
        }
    }
}
```

Template:

```html
<form :class="classes"></form>
```

Output:

```html
<form class="errors"></form>
```

## Inline Styles

Model:

```js
{
   primary: true,
   style: {
        display: "inline-block",
        borderRadius: "3px",
        background: this.primary ? "white" : "transparent",
        color: this.primary ? "black" : "white",
        border: "2px solid white",
    }
}
```

Template:

```html
<button :primary :style></button>
```

Output:

```html
<button
  primary
  style="
    display: inline-block; 
    border-radius: 3px; 
    background: white; 
    color: black; 
    border: 2px solid white;"
></button>
```

</x-app>
