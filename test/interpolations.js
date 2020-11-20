describe('attributes', () => {
  let view, rootNode;
  beforeEach(() => {
    rootNode = mount(html`<div id="container"></div>`);
  });

  it('should support multiple bindings', () => {
    view = synergy.render(
      rootNode,
      {
        c1: 'red',
        c2: 'green',
      },
      html` <p>{{c1}} + {{c2}}</p> `
    );
    assert.equal(rootNode.querySelector('p').textContent, 'red + green');
  });

  it('should apply all the values', () => {
    view = synergy.render(
      rootNode,
      {
        classes: ['one', 'two', 'three'],
      },
      html` <section class="{{classes}}"></section> `
    );

    assert.equal($('section').className, 'one two three');
  });

  it('should apply all the keys with truthy values', () => {
    view = synergy.render(
      rootNode,
      {
        classes: {
          one: true,
          two: false,
          three: {},
          four: null,
          five: '',
          six: 'ok',
        },
      },
      html` <section class="{{classes}}"></section> `
    );

    assert.equal($('section').className, 'one three six');
  });

  it('should spread attributes', () => {
    view = synergy.render(
      rootNode,
      {
        foo: {
          name: 'slider',
          type: 'range',
          min: '0',
          max: '360',
          step: null,
          ariaExpanded: false,
        },
      },
      html`
        <section>
          <input {{...foo}} />
        </section>
      `
    );

    assert.equal($('input').getAttribute('name'), 'slider');
    assert.equal($('input').getAttribute('type'), 'range');
    assert.equal($('input').getAttribute('min'), '0');
    assert.equal($('input').getAttribute('max'), '360');
    assert.equal($('input').getAttribute('step'), null);
    assert.equal($('input').getAttribute('aria-expanded'), 'false');
  });

  it('should remember previous spread attributes', async () => {
    view = synergy.render(
      rootNode,
      {
        foo: {
          name: 'slider',
          type: 'range',
          min: '0',
          max: '360',
          step: null,
          ariaExpanded: false,
        },
      },
      html`
        <section>
          <input {{...foo}} />
        </section>
      `
    );

    view.foo = {
      name: 'slider',
      min: '0',
      max: '360',
      step: 1,
      ariaExpanded: 'undefined',
    };

    await nextUpdate();

    assert.equal($('input').getAttribute('name'), 'slider');
    assert.equal($('input').getAttribute('type'), null);
    assert.equal($('input').getAttribute('min'), '0');
    assert.equal($('input').getAttribute('max'), '360');
    assert.equal($('input').getAttribute('step'), '1');
    assert.equal($('input').getAttribute('aria-expanded'), 'undefined');
  });

  it('should apply styles', () => {
    view = synergy.render(
      rootNode,
      {
        foo: `
          background-color: gold;
          color: tomato;
          width: 100px;
          height: 100px;
        `,
      },
      html` <section style="{{foo}}"></section> `
    );

    assert.equal(
      $('section').getAttribute('style'),
      'background-color: gold; color: tomato; width: 100px; height: 100px;'
    );
  });

  it('should preserve browser styles', async () => {
    view = synergy.render(
      rootNode,
      {
        foo: `
          background-color: gold;
          color: tomato;
          width: 100px;
          height: 100px;
        `,
      },
      html` <section style="{{foo}}"></section> `
    );

    $('section').style.opacity = '0.5';

    assert.ok(
      $('section').getAttribute('style').includes('background-color: gold;')
    );

    view.foo = `
      background-color: tomato;
      color: gold;
      width: 100px;
      height: 100px;
  `;

    await nextUpdate();

    assert.ok(
      $('section').getAttribute('style').includes('background-color: tomato;')
    );

    assert.ok($('section').getAttribute('style').includes('opacity: 0.5;'));
  });

  it('should apply styles (Object / kebab)', () => {
    view = synergy.render(
      rootNode,
      {
        foo: {
          'background-color': 'gold',
          color: 'tomato',
          width: '100px',
          height: '100px',
        },
      },
      html` <section style="{{foo}}"></section> `
    );

    assert.equal(
      $('section').getAttribute('style'),
      'background-color: gold; color: tomato; width: 100px; height: 100px;'
    );
  });

  it('should apply styles (Object / pascal)', () => {
    view = synergy.render(
      rootNode,
      {
        foo: {
          backgroundColor: 'gold',
          color: 'tomato',
          width: '100px',
          height: '100px',
        },
      },
      html` <section style="{{foo}}"></section> `
    );

    assert.equal(
      $('section').getAttribute('style'),
      'background-color: gold; color: tomato; width: 100px; height: 100px;'
    );
  });

  it('should allow whitespace formatting', () => {
    view = synergy.render(
      rootNode,
      {
        c1: 'red',
        c2: 'green',
      },
      html` <p name="{{ c1 }}">{{ c2 }}</p> `
    );
    assert.equal($('p').getAttribute('name'), 'red');
    assert.equal($('p').textContent, 'green');
  });

  it('should support negation', async () => {
    view = synergy.render(
      rootNode,
      {
        foo: true,
      },
      html` <p hidden="{{ !foo }}">boo!</p>`
    );

    assert.notOk($('p').hidden);

    view.foo = false;

    await nextUpdate();

    assert.ok($('p').hidden);
  });
});
