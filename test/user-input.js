import { define } from "../src/index.js"

describe("user input", () => {
  it("should bind the value to the named property", () => {
    let name = createName()

    let initialState = {
      message: "?",
    }

    define(
      name,
      () => ({
        initialState,
      }),
      html`<input name="message" /> the message is:
        <span class="message">{{message}}</span>`
    )

    mount(html`<${name}></${name}>`)

    assert.equal($("span.message").textContent, "?")
  })

  it("should bind the value to the named property (nested)", () => {
    let name = createName()

    let initialState = {
      nested: {
        message: "??",
      },
    }

    define(
      name,
      () => ({
        initialState,
      }),
      html`
        <input :name="nested.message" />
        the message is:
        <span class="message">{{nested.message}}</span>
      `
    )

    mount(html`<${name}></${name}>`)

    assert.equal($("span.message").textContent, "??")
  })

  it("should bind the value to the named + scoped property", () => {
    let name = createName()

    let initialState = {
      todos: [
        {
          title: "feed the cat",
          done: true,
        },
        {
          title: "walk the dog",
        },
      ],
    }

    define(
      name,
      () => ({
        initialState,
      }),
      html`
        <ul>
          <template each="todo in todos">
            <li>
              {{todo.title}}
              <input type="checkbox" :name="todo.done" />
            </li>
          </template>
        </ul>
      `
    )

    mount(html`<${name}></${name}>`)

    const li = $$("li")

    assert.equal(li[0].querySelector("input").checked, true)
    assert.equal(li[1].querySelector("input").checked, false)
  })

  it("should check the correct radio button", () => {
    let name = createName()

    define(
      name,
      () => ({
        initialState: {
          filter: "active",
        },
      }),
      html`
        <input type="radio" :name="filter" value="all" id="filter.all" />
        <label for="filter.all">all</label>
        <input type="radio" :name="filter" value="active" id="filter.active" />
        <label for="filter.active">active</label>
        <input
          type="radio"
          name="filter"
          value="complete"
          id="filter.complete"
        />
        <label for="filter.complete">complete</label>
      `
    )

    mount(html`<${name}></${name}>`)

    let checked = $(`input[type="radio"]:checked`)
    assert.equal(checked.value, "active")
  })

  it("should check the correct radio button", () => {
    let name = createName()

    let initialState = {}

    define(
      name,
      () => ({
        initialState,
      }),
      html`
        <input type="radio" name="filter" value="all" id="filter.all" />
        <label for="filter.all">all</label>
        <input type="radio" name="filter" value="active" id="filter.active" />
        <label for="filter.active">active</label>
        <input
          type="radio"
          name="filter"
          value="complete"
          id="filter.complete"
        />
        <label for="filter.complete">complete</label>
      `
    )

    mount(html`<${name}></${name}>`)

    let checked = $(`#container input[type="radio"]:checked`)
    assert.equal(checked, null)
  })

  it("should reflect the correct radio button", async () => {
    let name = createName()

    let initialState = {
      filter: "active",
    }

    define(
      name,
      () => ({
        initialState,
      }),
      html`
        <input type="radio" :name="filter" value="all" id="filter.all" />
        <label for="filter.all">all</label>
        <input type="radio" :name="filter" value="active" id="filter.active" />
        <label for="filter.active">active</label>
        <input
          type="radio"
          :name="filter"
          value="complete"
          id="filter.complete"
        />
        <label for="filter.complete">complete</label>
      `
    )

    mount(html`<${name}></${name}>`)

    $(`input[value="complete"]`).click()

    await nextFrame()

    assert.equal($(`input:checked`).value, "complete")
  })

  it("should select the correct option", async () => {
    let name = createName()

    let initialState = {
      $pets: "hamster",
    }

    define(
      name,
      () => ({
        initialState,
      }),
      html`
        <label for="pet-select">Choose a pet:</label>
        <select :name="$pets" id="pet-select">
          <option value="">--Please choose an option--</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="hamster">Hamster</option>
          <option value="parrot">Parrot</option>
          <option value="spider">Spider</option>
          <option value="goldfish">Goldfish</option>
        </select>
      `
    )

    mount(html`<${name}></${name}>`)

    assert.equal($("select option:checked").value, "hamster")

    $(name).pets = "parrot"

    await nextFrame()

    assert.equal($("select option:checked").value, "parrot")
  })

  it("should select the correct option (each option)", async () => {
    let name = createName()

    let initialState = {
      $pets: "Hamster",
      options: ["Dog", "Cat", "Hamster", "Parrot", "Spider", "Goldfish"],
    }

    define(
      name,
      () => ({
        initialState,
      }),
      html`
        <label for="pet-select">Choose a pet:</label>
        <select :name="$pets" id="pet-select">
          <option value="">--Please choose an option--</option>
          <option each="option in options" :value="option">{{ option }}</option>
        </select>
      `
    )

    mount(html`<${name}></${name}>`)

    assert.equal($("select option:checked").value, "Hamster")

    $(name).pets = "Parrot"

    await nextFrame()

    assert.equal($("select option:checked").value, "Parrot")
  })

  it("should select multiple", () => {
    let name = createName()

    let initialState = {
      pets: ["dog", "hamster"],
    }

    define(
      name,
      () => ({
        initialState,
      }),
      html`
        <label for="pet-select">Choose a pet:</label>
        <select :name="pets" id="pet-select" multiple>
          <option value="">--Please choose an option--</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="hamster">Hamster</option>
          <option value="parrot">Parrot</option>
          <option value="spider">Spider</option>
          <option value="goldfish">Goldfish</option>
        </select>
      `
    )

    mount(html`<${name}></${name}>`)

    assert.deepEqual(
      $$("select option:checked").map((option) => option.value),
      ["dog", "hamster"]
    )
  })

  it("should reflect selected option", async () => {
    let name = createName()

    define(
      name,
      () => ({
        initialState: {
          $pets: ["hamster"],
        },
      }),
      html`
        <label for="pet-select">Choose a pet:</label>
        <select :name="$pets" id="pet-select" multiple>
          <option value="">--Please choose an option--</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="hamster">Hamster</option>
          <option value="parrot">Parrot</option>
          <option value="spider">Spider</option>
          <option value="goldfish">Goldfish</option>
        </select>
      `
    )

    mount(html`<${name}></${name}>`)

    $("#pet-select").value = "parrot"

    $("#pet-select").dispatchEvent(
      new Event("input", {
        bubbles: true,
      })
    )

    await nextFrame()

    assert.deepEqual($(name).pets, "parrot")
  })

  it("should bind the named textarea", () => {
    let name = createName()

    let initialState = {
      text: "ok",
    }

    define(
      name,
      () => ({
        initialState,
      }),
      html` <textarea :name="text"></textarea> `
    )

    mount(html`<${name}></${name}>`)

    assert.equal($("textarea").value, "ok")
  })
})
