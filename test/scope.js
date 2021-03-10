describe('context', () => {
  let rootNode;
  beforeEach(() => {
    rootNode = mount(html`<div id="container"></div>`);
  });

  it('should observe context', () => {
    let name = createName();

    let view = {
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
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html` <h1 first>{{todo}}</h1>
        <ul>
          <template each="todo in todos">
            <li style="background-color: {{todo.colour}}">
              <p>{{todo.title}}</p>
              <p>{{message}}</p>
            </li>
          </template>
        </ul>
        <h1 second>{{todo}}</h1>`
    );

    mount(html`<${name}></${name}>`);

    assert.equal($('h1[first]').textContent.trim(), 'feed the dog');
    assert.equal($('li p').textContent.trim(), 'walk the cat');
    assert.equal($('li p:last-child').textContent.trim(), 'Hej!');
    assert.equal($('h1[second]').textContent.trim(), 'feed the dog');
  });

  it('should support nested scopes', async () => {
    let name = createName();

    let view = {
      artists: [
        {
          name: 'pablo picasso',
          tags: ['painter', 'sculptor', 'printmaker', 'ceramicist', 'theatre designer'],
        },
        {
          name: 'salvador dali',
          tags: ['painter', 'sculptor', 'photographer', 'writer'],
        },
      ],
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html`
        <template each="artist in artists">
          <article>
            <h4>{{artist.name}}</h4>
            <ul>
              <template each="tag in artist.tags">
                <li>{{tag}}</li>
              </template>
            </ul>
          </article>
        </template>
      `
    );

    mount(html`<${name}></${name}>`);

    assert.equal($('h4').textContent, view.artists[0].name);
    assert.equal($$('article:nth-of-type(1) li').length, view.artists[0].tags.length);
    assert.equal($$('article:nth-of-type(2) li').length, view.artists[1].tags.length);
    assert.equal($('article:nth-of-type(1) li').textContent, view.artists[0].tags[0]);
    assert.equal($('article:nth-of-type(2) li').textContent, view.artists[1].tags[0]);
  });
});
