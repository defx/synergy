describe('iterations', () => {
  it('should iterate over Array', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <ul>
          <!-- #each todo in todos -->
          <li style="background-color: {{todo.colour}}">
            <p>{{todo.title}}</p>
          </li>
          <!-- /each -->
        </ul>
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      node,
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
      'x-template'
    );

    let todos = Array.from(view.todos);

    $$('#container li').forEach((li, i) => {
      assert.equal(li.querySelector('p').textContent, todos[i].title);
    });
  });

  it('should iterate over Array keys', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <ul>
          <!-- #each colour in colours -->
          <li>
            <p>{{.}}</p>
            <p>{{colour}}</p>
          </li>
          <!-- /each -->
        </ul>
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      node,
      {
        colours: ['gold', 'tomato'],
      },
      'x-template'
    );

    $$('#container li').forEach((li, i) => {
      assert.equal(li.querySelector('p').textContent, i);
    });
  });

  it('should iterate over Set', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <ul>
          <!-- #each todo in todos -->
          <li style="background-color: {{todo.colour}}">
            <p>{{todo.title}}</p>
          </li>
          <!-- /each -->
        </ul>
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      node,
      {
        todos: new Set([
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
        ]),
      },
      'x-template'
    );

    let todos = Array.from(view.todos);

    $$('#container li').forEach((li, i) => {
      assert.equal(li.querySelector('p').textContent, todos[i].title);
    });
  });

  it('should iterate over Set keys', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <ul>
          <!-- #each todo in todos -->
          <li style="background-color: {{todo.colour}}">
            <p>{{.}}</p>
          </li>
          <!-- /each -->
        </ul>
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      node,
      {
        todos: new Set([
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
        ]),
      },
      'x-template'
    );

    let todos = Array.from(view.todos);

    $$('#container li').forEach((li, i) => {
      assert.equal(li.querySelector('p').textContent, i);
    });
  });

  it('should pass the list datum as the second argument', (done) => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <select name="chosenName">
          <!-- #each name in names -->
          <option value="{{name}}" onclick="handleClick">{{name}}</option>
          <!-- /each -->
        </select>
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      node,
      {
        names: ['tim', 'john', 'kim'],
        handleClick: function (e, d) {
          assert.equal(d, 'john');
          done();
        },
      },
      'x-template'
    );

    $('#container option[value="john"]').click();
  });

  it('should overwrite non-keyed list nodes', async () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <!-- #each colour in colours -->
        <p>{{colour.name}}</p>
        <!-- /each -->
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      node,
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
      'x-template'
    );

    let previousNodes = $$('#container p');

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

    await nextUpdate();

    let currentNodes = $$('#container p');

    assert.ok(previousNodes[0].isSameNode(currentNodes[0]));
    assert.ok(previousNodes[1].isSameNode(currentNodes[1]));
    assert.ok(previousNodes[2].isSameNode(currentNodes[2]));
  });

  it('should not overwrite non-keyed list nodes (default id present)', async () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <!-- #each colour in colours -->
        <p>{{colour.name}}</p>
        <!-- /each -->
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      node,
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
      'x-template'
    );

    let previousNodes = $$('#container p');

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

    await nextUpdate();

    let currentNodes = $$('#container p');

    assert.ok(previousNodes[0].isSameNode(currentNodes[1]));
    assert.ok(previousNodes[1].isSameNode(currentNodes[0]));
    assert.ok(previousNodes[2].isSameNode(currentNodes[2]));
  });

  it('should not overwrite non-keyed list nodes (custom key)', async () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <!-- #each colour in colours (key=foo) -->
        <p>{{colour.name}}</p>
        <!-- /each -->
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      node,
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
      'x-template'
    );

    let previousNodes = $$('#container p');

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

    await nextUpdate();

    let currentNodes = $$('#container p');

    assert.ok(previousNodes[0].isSameNode(currentNodes[1]));
    assert.ok(previousNodes[1].isSameNode(currentNodes[0]));
    assert.ok(previousNodes[2].isSameNode(currentNodes[2]));
  });

  it('should support multiple top-level nodes', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <!-- #each colour in colours -->
        <p>{{colour.name}}</p>
        <p>{{colour.id}}</p>
        <!-- /each -->
      </template>
    `);

    let node = document.getElementById('container');

    let view = synergy.render(
      node,
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
      'x-template'
    );

    assert.ok(
      node.innerHTML.includes(
        `<p>red</p><p>1</p><p>green</p><p>2</p><p>gold</p><p>3</p>`
      )
    );
  });
});
