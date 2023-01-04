<head>
  <title>Forms | Synergy JS</title>
</head>

# Forms

Synergy makes working with form data a breeze by automagically binding named form controls to state properties of the same name.

State:

```js
{
  color: "#4287f5"
}
```

Template:

```html
<input :name="color" type="color" />
```

## Select

Attribute a name to your `<select>` and the value
of the bound property will reflect that of the
currently selected `<option>`

State:

```js
{
  pets: "hamster"
}
```

Template:

```html
<label for="pet-select">Choose a pet:</label>
<select :name="pets" id="pet-select">
  <option value="">--Please choose an option--</option>
  <option value="dog">Dog</option>
  <option value="cat">Cat</option>
  <option value="hamster">Hamster</option>
  <option value="parrot">Parrot</option>
  <option value="spider">Spider</option>
  <option value="goldfish">Goldfish</option>
</select>
```

The standard HTML `<select>` element also supports
the ability to select multiple options, using the
**multiple** attribute:

```html
<select :name="pets" id="pet-select" multiple></select>
```

A `<select>` with `[multiple]` binds to an Array
on your data:

```js
{
  pets: ["hamster", "spider"]
}
```

## Radio Buttons

Add a name to each radio button to indicate which
_group_ it belongs to.

```html
<input type="radio" :name="filter" value="all" id="filter.all" />
<input type="radio" :name="filter" value="active" id="filter.active" />
<input type="radio" :name="filter" value="complete" id="filter.complete" />
```

As with `<select>`, the value of the named
property will reflect the value of the selected
`<input type="radio">`.

```js
{
  filter: "active"
}
```
