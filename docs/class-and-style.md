# Class & Style



### Multiple classes with Array

View:

```javascript
{
  classes: [
    "w32",
    "h32",
    "rounded-full",
    "mx-auto",
  ];
}
```

Template:

```markup
<img class="{{ classes }}" />
```

Output:

```markup
<img
  class="w32 h32 rounded-full mx-auto"
/>
```

### 

### Static Conditional Classes with Object

View:

```javascript
{
    classes: {
        'mx-auto': true,
        'has-error': false
    }
}
```

Template:

```markup
<div class="{{ classes }}"></div>
```

Output:

```markup
<div class="mx-auto"></div>
```

### 

### Dynamic Conditional Classes with Getter + Object

View:

```javascript
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

```markup
<form class="{{ classes }}"></form>
```

Output:

```markup
<form class="errors"></form>
```

### 

### Inline Styles

View:

```javascript
{
   styles: {
        display: "inline-block",
        borderRadius: "3px",
        background: primary ? "white" : "transparent",
        color: primary ? "black" : "white",
        border: "2px solid white",
    }
}
```

Template:

```markup
<button
  primary
  style="{{ styles }}"
></button>
```

Output:

```markup
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

