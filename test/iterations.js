describe('iterations', () => {
  let view, rootNode;
  beforeEach(() => {
    rootNode = mount(html`<div id="container"></div>`);
  });

  it('should iterate over Array', () => {
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
      html`
        <ul>
          <!-- #each todo in todos -->
          <li style="background-color: {{todo.colour}}">
            <p>{{todo.title}}</p>
          </li>
          <!-- /each -->
        </ul>
      `
    );

    let todos = Array.from(view.todos);

    $$('#container li').forEach((li, i) => {
      assert.equal(li.querySelector('p').textContent, todos[i].title);
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
          <!-- #each colour in colours -->
          <li id="item-{{ # }}">
            <p>{{ # }}</p>
            <p>{{ colour }}</p>
          </li>
          <!-- /each -->
        </ul>
      `
    );

    $$('#container li').forEach((li, i) => {
      assert.equal(li.querySelector('p').textContent, i);
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
          <!-- #each name in names -->
          <option value="{{name}}" onclick="handleClick">{{name}}</option>
          <!-- /each -->
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
        <!-- #each colour in colours -->
        <p>{{colour.name}}</p>
        <!-- /each -->
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
        <!-- #each colour in colours -->
        <p>{{colour.name}}</p>
        <!-- /each -->
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
        <!-- #each colour in colours (key=foo) -->
        <p>{{colour.name}}</p>
        <!-- /each -->
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
          <!-- #each colour in colours -->
          <p>{{colour.name}}</p>
          <p>{{colour.id}}</p>
          <!-- /each -->
        </div>
      `
    );

    assert.ok(
      rootNode.innerHTML.includes(
        `<p>red</p><p>1</p><p>green</p><p>2</p><p>gold</p><p>3</p>`
      )
    );
  });
});
