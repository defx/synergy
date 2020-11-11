describe('attributes', () => {
  it('should support multiple bindings', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <p>{{c1}} + {{c2}}</p>
      </template>
    `);

    synergy.render(
      {
        c1: 'red',
        c2: 'green',
      },
      'x-template',
      'container'
    );
    let node = document.querySelector('#container');
    assert.equal(node.querySelector('p').textContent, 'red + green');
  });

  it('should apply all the values', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <section class="{{classes}}"></section>
      </template>
    `);

    synergy.render(
      {
        classes: ['one', 'two', 'three'],
      },
      'x-template',
      'container'
    );
    let node = document.querySelector('#container');
    assert.equal(node.querySelector('section').className, 'one two three');
  });

  it('should apply all the keys with truthy values', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <section class="{{classes}}"></section>
      </template>
    `);

    synergy.render(
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
      'x-template',
      'container'
    );
    let node = document.querySelector('#container');
    assert.equal(node.querySelector('section').className, 'one three six');
  });

  it('should spread attributes', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <input {{...foo}} />
      </template>
    `);

    synergy.render(
      {
        foo: {
          name: 'slider',
          type: 'range',
          min: '0',
          max: '360',
          step: null,
        },
      },
      'x-template',
      'container'
    );

    let input = document.querySelector('#container input');

    assert.equal(input.getAttribute('name'), 'slider');
    assert.equal(input.getAttribute('type'), 'range');
    assert.equal(input.getAttribute('min'), '0');
    assert.equal(input.getAttribute('max'), '360');
    assert.equal(input.hasAttribute('step'), false);
  });

  it('should apply styles', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <section style="{{foo}}"></section>
      </template>
    `);

    synergy.render(
      {
        foo: `
          background-color: gold;
          color: tomato;
          width: 100px;
          height: 100px;
        `,
      },
      'x-template',
      'container'
    );

    assert.equal(
      document.querySelector('#container section').getAttribute('style'),
      'background-color: gold; color: tomato; width: 100px; height: 100px;'
    );
  });

  it('should preserve browser styles', async () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <section style="{{foo}}"></section>
      </template>
    `);

    let view = synergy.render(
      {
        foo: `
          background-color: gold;
          color: tomato;
          width: 100px;
          height: 100px;
        `,
      },
      'x-template',
      'container'
    );

    let section = document.querySelector('#container section');

    section.style.opacity = '0.5';

    assert.ok(
      section.getAttribute('style').includes('background-color: gold;')
    );

    view.foo = `
      background-color: tomato;
      color: gold;
      width: 100px;
      height: 100px;
  `;

    await nextUpdate();

    assert.ok(
      section.getAttribute('style').includes('background-color: tomato;')
    );

    assert.ok(section.getAttribute('style').includes('opacity: 0.5;'));
  });

  it('should apply styles (Object / kebab)', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <section style="{{foo}}"></section>
      </template>
    `);

    synergy.render(
      {
        foo: {
          'background-color': 'gold',
          color: 'tomato',
          width: '100px',
          height: '100px',
        },
      },
      'x-template',
      'container'
    );

    let section = document.querySelector('#container section');

    assert.equal(
      section.getAttribute('style'),
      'background-color: gold; color: tomato; width: 100px; height: 100px;'
    );
  });

  it('should apply styles (Object / pascal)', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <section style="{{foo}}"></section>
      </template>
    `);

    let node = document.getElementById('container');
    synergy.render(
      {
        foo: {
          backgroundColor: 'gold',
          color: 'tomato',
          width: '100px',
          height: '100px',
        },
      },
      'x-template',
      'container'
    );

    let section = node.querySelector('section');

    assert.equal(
      section.getAttribute('style'),
      'background-color: gold; color: tomato; width: 100px; height: 100px;'
    );
  });

  it('should allow whitespace formatting', () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <p name="{{ c1 }}">{{ c2 }}</p>
      </template>
    `);

    let node = document.getElementById('container');
    synergy.render(
      {
        c1: 'red',
        c2: 'green',
      },
      'x-template',
      'container'
    );
    let p = node.querySelector('p');
    assert.equal(p.getAttribute('name'), 'red');
    assert.equal(p.textContent, 'green');
  });

  it('should support negation', async () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <p hidden="{{ !foo }}">boo!</p>
      </template>
    `);

    let node = document.getElementById('container');
    let view = synergy.render(
      {
        foo: true,
      },
      'x-template',
      'container'
    );

    let p = node.querySelector('p');

    assert.notOk(p.hidden);

    view.foo = false;

    await nextUpdate();

    assert.ok(p.hidden);
  });
});
