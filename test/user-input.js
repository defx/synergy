describe('input[name]', () => {
  it('should bind the value to the named property', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <input name="message" /> the message is:
        <span class="message">{{message}}</span>
      </template>
    `);

    let node = document.getElementById('container');

    synergy.render(
      {
        message: '?',
      },
      'x-template',
      'container'
    );

    assert.equal($('#container span.message').textContent, '?');
  });

  it('should bind the value to the named property (nested)', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <input name="nested.message" />
        the message is: <span class="message">{{nested.message}}</span>
      </template>
    `);

    let node = document.getElementById('container');

    synergy.render(
      {
        nested: {
          message: '??',
        },
      },
      'x-template',
      'container'
    );

    assert.equal($('#container span.message').textContent, '??');
  });

  it('should bind the value to the named + scoped property', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <ul>
          <!-- #each todo in todos -->
          <li>
            {{todo.title}}
            <input type="checkbox" name="todo.done" />
          </li>
          <!-- /each -->
        </ul>
      </template>
    `);

    let node = document.getElementById('container');

    synergy.render(
      {
        todos: [
          {
            title: 'feed the cat',
            done: true,
          },
          {
            title: 'walk the dog',
          },
        ],
      },
      'x-template',
      'container'
    );

    const li = $$('#container li');

    assert.equal(li[0].querySelector('input').checked, true);
    assert.equal(li[1].querySelector('input').checked, false);
  });

  it('should check the correct radio button', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
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
      </template>
    `);

    let node = document.getElementById('container');

    synergy.render(
      {
        filter: 'active',
      },
      'x-template',
      'container'
    );

    let checked = $(`#container input[type="radio"]:checked`);
    assert.equal(checked.value, 'active');
  });

  it('should check the correct radio button', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
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
      </template>
    `);

    let node = document.getElementById('container');

    synergy.render({}, 'x-template', 'container');

    let checked = $(`#container input[type="radio"]:checked`);
    assert.equal(checked, null);
  });

  it('should reflect the correct radio button', async () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
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
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      {
        filter: 'active',
      },
      'x-template',
      'container'
    );

    $(`#container input[type="radio"][value="complete"]`).click();
    await nextUpdate();
    assert.equal(view.filter, 'complete');
  });

  it('should select the correct option', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
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
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      {
        pets: 'hamster',
      },
      'x-template',
      'container'
    );

    assert.equal($('#container select option:checked').value, 'hamster');
  });

  it('should select multiple', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <label for="pet-select">Choose a pet:</label>
        <select name="pets" id="pet-select" multiple>
          <option value="">--Please choose an option--</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="hamster">Hamster</option>
          <option value="parrot">Parrot</option>
          <option value="spider">Spider</option>
          <option value="goldfish">Goldfish</option>
        </select>
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      {
        pets: ['dog', 'hamster'],
      },
      'x-template',
      'container'
    );

    assert.deepEqual(
      $$('#container select option:checked').map((option) => option.value),
      ['dog', 'hamster']
    );
  });

  it('should bind the named textarea', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <textarea name="text"></textarea>
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      {
        text: 'ok',
      },
      'x-template',
      'container'
    );

    assert.equal($('#container textarea').value, 'ok');
  });

  it('should resolve target bindings', async () => {
    let clicked = false;

    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <button onclick="handleClick">
          <p></p>
        </button>
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      {
        handleClick() {
          clicked = true;
        },
      },
      'x-template',
      'container'
    );

    $('#container button p').click();

    await nextUpdate();

    assert.ok(clicked);
  });
});
