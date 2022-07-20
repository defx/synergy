<x-app>

# Events

Synergy allows you to map events to event handlers of the same name within your Models `update` object.

Model:

```js
const factory = () => ({
  update: {
    sayHello: (state) => ({
      ...state,
      greeting: "Hello"
    }),
  })
```

Template:

```html
<button :onclick="sayHello">Say hello</button>
```

## Template scope

Because repeated blocks create scoped value contexts (i.e., new values created within the iteration as part of the `:each="x in y"` expression), it is useful to be able to access those values within your handler. You can do this via the `context` property of the second argument to your event handler.

Model:

```js
const factory = () => {
  return {
    state: {
      artists: [
        {
          name: "pablo picasso",
          tags: [
            "painter",
            "sculptor",
            "printmaker",
            "ceramicist",
            "theatre designer",
          ],
        },
        {
          name: "salvador dali",
          tags: ["painter", "sculptor", "photographer", "writer"],
        },
      ],
    },
    update: {
      select: (state, { context }) => {
        const { artist, tag } = context

        return {
          ...state,
          selected: {
            artist,
            tag,
          },
        }
      },
    },
  }
}
```

Template:

```html
<article :each="artist in artists">
  <h4>{{ artist.name }}</h4>
  <ul>
    <li :each="tag in artist.tags" :onclick="select">{{ tag }}</li>
  </ul>
</article>
```

Note that the value of `artist` and `tag` within the handler are specific to the repeated block from which the event was raised. So if you click on the "theatre designer" tag, for example, then `tag` will have a value of "theatre designer" and `artist` will equal "Pablo Picasso"

</x-app>
