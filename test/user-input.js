describe('input[name]', () => {
  let rootNode, $$, $;
  beforeEach(() => {
    rootNode = mount(html`<div id="container"></div>`);
    $$ = (x) => Array.from(rootNode.querySelectorAll(x));
    $ = (x) => rootNode.querySelector(x);
  });

  it('should bind the value to the named property', () => {
    let view = synergy.render(
      rootNode,
      {
        message: '?',
      },
      html`<input name="message" /> the message is:
        <span class="message">{{message}}</span>`
    );

    assert.equal(textContent($('span.message')), '?');
  });

  it('should bind the value to the named property (nested)', () => {
    let view = synergy.render(
      rootNode,
      {
        nested: {
          message: '??',
        },
      },
      html`
        <input name="nested.message" />
        the message is: <span class="message">{{nested.message}}</span>
      `
    );

    assert.equal(textContent($('span.message')), '??');
  });

  it('should bind the value to the named + scoped property', () => {
    let view = synergy.render(
      rootNode,
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
      html`
        <ul>
          <!-- #each todo in todos -->
          <li>
            {{todo.title}}
            <input type="checkbox" name="todo.done" />
          </li>
          <!-- /each -->
        </ul>
      `
    );

    const li = $$('#container li');

    assert.equal(li[0].querySelector('input').checked, true);
    assert.equal(li[1].querySelector('input').checked, false);
  });

  it('should check the correct radio button', () => {
    let view = synergy.render(
      rootNode,
      {
        filter: 'active',
      },
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
    );

    let checked = $(`#container input[type="radio"]:checked`);
    assert.equal(checked.value, 'active');
  });

  it('should check the correct radio button', () => {
    let view = synergy.render(
      rootNode,
      {},
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
    );

    let checked = $(`#container input[type="radio"]:checked`);
    assert.equal(checked, null);
  });

  it('should reflect the correct radio button', async () => {
    let view = synergy.render(
      rootNode,
      {
        filter: 'active',
      },
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
    );

    $(`#container input[type="radio"][value="complete"]`).click();
    await nextUpdate();
    assert.equal(view.filter, 'complete');
  });

  it('should select the correct option', () => {
    let view = synergy.render(
      rootNode,
      {
        pets: 'hamster',
      },
      html`
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
      `
    );

    assert.equal($('#container select option:checked').value, 'hamster');
  });

  it('should select multiple', () => {
    let view = synergy.render(
      rootNode,
      {
        pets: ['dog', 'hamster'],
      },
      html`
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
      `
    );

    assert.deepEqual(
      $$('#container select option:checked').map((option) => option.value),
      ['dog', 'hamster']
    );
  });

  it('should bind the named textarea', () => {
    let view = synergy.render(
      rootNode,
      {
        text: 'ok',
      },
      html` <textarea name="text"></textarea> `
    );

    assert.equal($('#container textarea').value, 'ok');
  });

  it('should resolve target bindings', async () => {
    let clicked = false;

    let view = synergy.render(
      rootNode,
      {
        handleClick() {
          clicked = true;
        },
      },
      html`<button onclick="handleClick">
        <p></p>
      </button>`
    );

    $('button p').click();

    await nextUpdate();

    assert.ok(clicked);
  });
});
