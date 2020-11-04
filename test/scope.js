describe('context', () => {
  let view, rootNode, $$, $;
  beforeEach(() => {
    rootNode = mount(html`<div id="container"></div>`);
    $$ = (x) => Array.from(rootNode.querySelectorAll(x));
    $ = (x) => rootNode.querySelector(x);
  });

  it('should observe context', () => {
    let view = synergy.render(
      rootNode,
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
      html` <h1 first>{{todo}}</h1>
        <ul>
          <li each="todo in todos" style="background-color: {{todo.colour}}">
            <p>{{todo.title}}</p>
            <p>{{message}}</p>
          </li>
        </ul>
        <h1 second>{{todo}}</h1>`
    );

    assert.equal($('h1[first]').textContent.trim(), 'feed the dog');
    assert.equal($('li p').textContent.trim(), 'walk the cat');
    assert.equal($('li p:last-child').textContent.trim(), 'Hej!');
    assert.equal($('h1[second]').textContent.trim(), 'feed the dog');
  });

  it('should support nested scopes', async () => {
    let view = synergy.render(
      rootNode,
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
        ],
      },
      html`
        <article each="artist in artists">
          <h4>{{artist.name}}</h4>
          <ul>
            <li each="tag in artist.tags">{{tag}}</li>
          </ul>
        </article>
      `
    );
  });

  it('should support nested scopes', async () => {
    let view = synergy.render(
      rootNode,
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
      html`
        <article each="artist in artists">
          <h4>{{artist.name}}</h4>
          <ul>
            <li each="tag in artist.tags">{{tag}}</li>
          </ul>
        </article>
      `
    );

    assert.equal(textContent($('h4')), view.artists[0].name);
    assert.equal(
      $$('article:nth-of-type(1) li').length,
      view.artists[0].tags.length
    );
    assert.equal(
      $$('article:nth-of-type(2) li').length,
      view.artists[1].tags.length
    );
    assert.equal(
      textContent($('article:nth-of-type(1) li')),
      view.artists[0].tags[0]
    );
    assert.equal(
      textContent($('article:nth-of-type(2) li')),
      view.artists[1].tags[0]
    );
  });
});
