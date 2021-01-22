describe('iterations', () => {
  let view, rootNode;
  beforeEach(() => {
    rootNode = mount(html`<div id="container"></div>`);
  });

  it('should iterate over Array', () => {
    let tpl1 = html`
      <ul>
        <template each="todo in todos">
          <li style="background-color: {{todo.colour}}">
            <p>{{todo.title}}</p>
          </li>
        </template>
      </ul>
    `;

    let tpl2 = html`
      <ul>
        <template each="todo in todos">
          <li style="background-color: {{todo.colour}}">
            <p>{{todo.title}}</p>
          </li>
        </template>
      </ul>
    `;

    view = synergy.render(
      rootNode,
      {
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
      },
      tpl2
    );

    let todos = Array.from(view.todos);

    $$('#container li').forEach((li, i) => {
      assert.equal(
        li.querySelector('p').textContent,
        todos[i].title
      );
    });
  });

  it('should iterate over Array keys', () => {
    const view = synergy.render(
      rootNode,
      {
        colours: ['gold', 'tomato'],
      },
      html`
        <ul>
          <template each="colour in colours">
            <li data-index="{{ # }}">
              <p>{{ # }}</p>
              <p>{{ colour }}</p>
            </li>
          </template>
        </ul>
      `
    );

    $$('#container li').forEach((li, i) => {
      assert.equal(li.querySelector('p').textContent, i);
      assert.equal(li.dataset.index, i);
    });
  });

  it('should pass the list datum as the second argument', (done) => {
    const view = synergy.render(
      rootNode,
      {
        names: ['tim', 'john', 'kim'],
        handleClick: function (e, d) {
          assert.equal(d, 'john');
          done();
        },
      },
      html`
        <select name="chosenName">
          <template each="name in names">
            <option value="{{name}}" onclick="handleClick">
              {{name}}
            </option>
          </template>
        </select>
      `
    );

    rootNode.querySelector('option[value="john"]').click();
  });

  it('should overwrite non-keyed list nodes', async () => {
    view = synergy.render(
      rootNode,
      {
        colours: [
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
      },
      html`
        <template each="colour in colours">
          <p>{{colour.name}}</p>
        </template>
      `
    );

    let previousNodes = $$('p');

    view.colours = [
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
    view = synergy.render(
      rootNode,
      {
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
      },
      html`
        <template each="colour in colours">
          <p>{{colour.name}}</p>
        </template>
      `
    );

    let previousNodes = $$('p');

    view.colours = [
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
    view = synergy.render(
      rootNode,
      {
        colours: [
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
      },
      html`
        <template each="colour in colours" key="foo">
          <p>{{colour.name}}</p>
        </template>
      `
    );

    let previousNodes = $$('p');

    view.colours = [
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
    view = synergy.render(
      rootNode,
      {
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

    assert.ok(
      rootNode.innerHTML.includes(
        `<p>red</p><p>1</p><p>green</p><p>2</p><p>gold</p><p>3</p>`
      )
    );
  });

  it('should support negations within repeated block', () => {
    view = synergy.render(
      rootNode,
      {
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
    assert.equal($$('.colour')[0].hidden, false);
    assert.equal($$('.colour')[1].hidden, true);
    assert.equal($$('.colour')[2].hidden, true);
  });
});
