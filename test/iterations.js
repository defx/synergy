describe('iterations', () => {
  let view, rootNode;
  beforeEach(() => {
    rootNode = mount(html`<div id="container"></div>`);
  });

  it('should iterate over Array', () => {
    let name = createName();

    let view = {
      todos: [
        {
          title: 'walk the cat',
          subtitle: 'ok',
          colour: 'tomato',
        },
        {
          title: 'shampoo the dog',
          subtitle: 'thanks',
          colour: 'gold',
        },
      ],
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html`
        <ul>
          <template each="todo in todos">
            <li style="background-color: {{todo.colour}}">
              <p>{{todo.title}}</p>
            </li>
          </template>
        </ul>
      `
    );

    mount(html`<${name}></${name}>`);

    let todos = Array.from(view.todos);

    $$('#container li').forEach((li, i) => {
      assert.equal(li.querySelector('p').textContent, todos[i].title);
    });
  });

  it('should iterate over Array keys', () => {
    let name = createName();

    let view = {
      colours: ['gold', 'tomato'],
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html`
        <ul>
          <template each="(colour, index) in colours">
            <li data-index="{{ index }}">
              <p>{{ index }}</p>
              <p>{{ colour }}</p>
            </li>
          </template>
        </ul>
      `
    );

    mount(html`<${name}></${name}>`);

    $$('li').forEach((li, i) => {
      assert.equal(li.querySelector('p').textContent, i);
      assert.equal(li.dataset.index, i);
    });
  });

  it('should overwrite non-keyed list nodes', async () => {
    let name = createName();

    synergy.define(
      name,
      ({
        colours = [
          {
            name: 'red',
          },
          {
            name: 'green',
          },
          {
            name: 'gold',
          },
        ],
      }) => {
        return { colours };
      },
      html`
        <template each="colour in colours">
          <p>{{colour.name}}</p>
        </template>
      `
    );

    mount(html`<${name}></${name}>`);

    let previousNodes = $$('p');

    $(name).colours = [
      {
        name: 'red',
      },
      {
        name: 'red',
      },
      {
        name: 'red',
      },
    ];

    await nextFrame();

    let currentNodes = $$('p');

    assert.ok(previousNodes[0].isSameNode(currentNodes[0]));
    assert.ok(previousNodes[1].isSameNode(currentNodes[1]));
    assert.ok(previousNodes[2].isSameNode(currentNodes[2]));
  });

  it('should not overwrite non-keyed list nodes (default id present)', async () => {
    let name = createName();

    synergy.define(
      name,
      ({
        colours = [
          { name: 'red', id: 1 },
          { name: 'green', id: 2 },
          { name: 'gold', id: 3 },
        ],
      }) => {
        return { colours };
      },
      html`
        <template each="colour in colours">
          <p>{{colour.name}}</p>
        </template>
      `
    );

    mount(html`<${name}></${name}>`);

    let previousNodes = $$('p');

    $(name).colours = [
      {
        name: 'red',
        id: 2,
      },
      {
        name: 'red',
        id: 1,
      },
      {
        name: 'red',
        id: 3,
      },
    ];

    await nextFrame();

    let currentNodes = $$('p');

    assert.ok(previousNodes[0].isSameNode(currentNodes[1]));
    assert.ok(previousNodes[1].isSameNode(currentNodes[0]));
    assert.ok(previousNodes[2].isSameNode(currentNodes[2]));
  });

  it('should not overwrite non-keyed list nodes (custom key)', async () => {
    let name = createName();

    synergy.define(
      name,
      ({
        colours = [
          {
            name: 'red',
            foo: 1,
          },
          {
            name: 'green',
            foo: 2,
          },
          {
            name: 'gold',
            foo: 3,
          },
        ],
      }) => {
        return { colours };
      },
      html`
        <template each="colour in colours" key="foo">
          <p>{{colour.name}}</p>
        </template>
      `
    );

    mount(html`<${name}></${name}>`);

    let previousNodes = $$('p');

    $(name).colours = [
      {
        name: 'red',
        foo: 2,
      },
      {
        name: 'red',
        foo: 1,
      },
      {
        name: 'red',
        foo: 3,
      },
    ];

    await nextFrame();

    let currentNodes = $$('p');

    assert.ok(previousNodes[0].isSameNode(currentNodes[1]));
    assert.ok(previousNodes[1].isSameNode(currentNodes[0]));
    assert.ok(previousNodes[2].isSameNode(currentNodes[2]));
  });

  it('should support multiple top-level nodes', () => {
    let name = createName();

    let view = {
      colours: [
        {
          name: 'red',
          id: 1,
        },
        {
          name: 'green',
          id: 2,
        },
        {
          name: 'gold',
          id: 3,
        },
      ],
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html`
        <div>
          <template each="colour in colours">
            <p>{{colour.name}}</p>
            <p>{{colour.id}}</p>
          </template>
        </div>
      `
    );

    mount(html`<${name}></${name}>`);

    assert.ok(
      $(name).innerHTML.includes(`<p>red</p><p>1</p><p>green</p><p>2</p><p>gold</p><p>3</p>`)
    );
  });

  it('should support negations within repeated block', () => {
    let name = createName();

    let view = {
      colours: [
        {
          name: 'red',
          id: 1,
          show: true,
        },
        {
          name: 'green',
          id: 2,
          show: false,
        },
        {
          name: 'gold',
          id: 3,
          show: false,
        },
      ],
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html`
        <div>
          <template each="colour in colours">
            <div class="colour" hidden="{{ !colour.show }}">
              <p>{{colour.name}}</p>
              <p>{{colour.id}}</p>
            </div>
          </template>
        </div>
      `
    );

    mount(html`<${name}></${name}>`);

    assert.equal($$('.colour')[0].hidden, false);
    assert.equal($$('.colour')[1].hidden, true);
    assert.equal($$('.colour')[2].hidden, true);
  });
});
