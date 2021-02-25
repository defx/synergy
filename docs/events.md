# Events

Synergy assumes any attribute name prefixed with "on" to point to an event handler on your viewmodel.

View:

```javascript
{
  sayHello: function() {
    alert("hi!");
  }
};
```

Template:

```markup
<button onclick="sayHello">
  Say hello
</button>
```

The first argument to your event handler is always a native DOM Event object

```javascript
{
  handleClick: function(event) {
    event.preventDefault();
    console.log("the link was clicked");
  }
};
```

If the target of the event is within a repeated block, then the second argument to your handler will be the datum for that particular item.

View:

```javascript
{
  todos: [
    /* ... */
  ],
  todoClicked: function(event, todo) {
    /*... */
  };
}
```

Template:

```markup
<ul>
  <template each="todo in todos">
    <li>
      <h3 onclick="todoClicked">
        {{ todo.title }}
      </h3>
    </li>
  </template>
</ul>
```

