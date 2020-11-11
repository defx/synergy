describe('context', () => {
  it('should observe context', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <h1 first>{{todo}}</h1>
        <ul>
          <!-- #each todo in todos -->
          <li style="background-color: {{todo.colour}}">
            <p>{{todo.title}}</p>
            <p>{{message}}</p>
          </li>
          <!-- /each -->
        </ul>
        <h1 second>{{todo}}</h1>
      </template>
    `);

    let view = synergy.render(
      {
        todo: 'feed the dog',
        message: 'Hej!',
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
      'x-template',
      'container'
    );

    assert.equal($('#container h1[first]').textContent, 'feed the dog');
    assert.equal($('#container li p').textContent, 'walk the cat');
    assert.equal($('#container li p:last-child').textContent, 'Hej!');
    assert.equal($('#container h1[second]').textContent, 'feed the dog');
  });

  it('should support nested scopes', async () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <!-- #each artist in artists -->
        <article>
          <h4>{{artist.name}}</h4>
          <ul>
            <!-- #each tag in artist.tags -->
            <li>{{tag}}</li>
            <!-- /each -->
          </ul>
        </article>
        <!-- /each -->
      </template>
    `);

    let view = synergy.render(
      {
        artists: [
          {
            name: 'pablo picasso',
            tags: [
              'painter',
              'sculptor',
              'printmaker',
              'ceramicist',
              'theatre designer',
            ],
          },
          {
            name: 'salvador dali',
            tags: ['painter', 'sculptor', 'photographer', 'writer'],
          },
        ],
      },
      'x-template',
      'container'
    );

    assert.equal($('#container h4').textContent, view.artists[0].name);
    assert.equal(
      $$('#container article:nth-of-type(1) li').length,
      view.artists[0].tags.length
    );
    assert.equal(
      $$('#container article:nth-of-type(2) li').length,
      view.artists[1].tags.length
    );
    assert.equal(
      $('#container article:nth-of-type(1) li').textContent,
      view.artists[0].tags[0]
    );
    assert.equal(
      $('#container article:nth-of-type(2) li').textContent,
      view.artists[1].tags[0]
    );
  });
});
