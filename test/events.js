describe('events', () => {
  let rootNode;
  beforeEach(() => {
    rootNode = mount(html`<div id="container"></div>`);
  });
  it('should support invocation of named function without parentheses or arguments', async () => {
    let args;

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
        foo(...argz) {
          args = argz;
        },
      },
      html`
        <template each="artist in artists">
          <article>
            <h4>{{artist.name}}</h4>
            <ul>
              <template each="tag in artist.tags">
                <li onclick="foo">{{tag}}</li>
              </template>
            </ul>
          </article>
        </template>
      `
    );

    $('article:nth-of-type(2) li').click(); //salvador dali painter

    await nextFrame();

    assert.deepEqual(args.length, 0);
  });

  it('should support invocation of named function with parentheses but without arguments', async () => {
    let args;

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
        foo(...argz) {
          args = argz;
        },
      },
      html`
        <template each="artist in artists">
          <article>
            <h4>{{artist.name}}</h4>
            <ul>
              <template each="tag in artist.tags">
                <li onclick="foo()">{{tag}}</li>
              </template>
            </ul>
          </article>
        </template>
      `
    );

    $('article:nth-of-type(2) li').click(); //salvador dali painter

    await nextFrame();

    assert.deepEqual(args.length, 0);
  });

  it('should support scoped arguments', async () => {
    let args;

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
        foo(...argz) {
          args = argz;
        },
      },
      html`
        <template each="artist in artists">
          <article>
            <h4>{{artist.name}}</h4>
            <ul>
              <template each="tag in artist.tags">
                <li onclick="foo(tag,artist)">{{tag}}</li>
              </template>
            </ul>
          </article>
        </template>
      `
    );

    $('article:nth-of-type(2) li').click(); //salvador dali painter

    await nextFrame();

    assert.equal(args[0], view.artists[1].tags[0]);
    assert.equal(args[1], view.artists[1]);
  });

  it('should support fat arrow syntax for passing named event object', async () => {
    let args;

    let view = synergy.render(
      rootNode,
      {
        fish: 'plankton',
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
        foo(...argz) {
          args = argz;
        },
      },
      html`
        <template each="artist in artists">
          <article>
            <h4>{{artist.name}}</h4>
            <ul>
              <template each="tag in artist.tags">
                <li onclick="bar => foo(bar, tag, artist, fish)">{{tag}}</li>
              </template>
            </ul>
          </article>
        </template>
      `
    );

    $('article:nth-of-type(2) li').click(); //salvador dali painter

    await nextFrame();

    assert.ok(args[0] instanceof MouseEvent);
    assert.equal(args[1], view.artists[1].tags[0]);
    assert.equal(args[2], view.artists[1]);
    assert.equal(args[3], view.fish);
  });
});
