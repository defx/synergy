describe('attributes', () => {
  let view, rootNode;
  beforeEach(() => {
    rootNode = mount(html`<div id="container"></div>`);
  });

  it('should always cast primitive values to strings, unless null or undefined', () => {
    let name = createName();

    let view = {
      boolean: false,
      undefined: undefined,
      null: null,
      number: 0,
      string: 'string',
      foo: 'bar',
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html`
        <ul>
          <li id="boolean">{{ boolean }}</li>
          <li id="undefined">{{ undefined }}</li>
          <li id="null">{{ null }}</li>
          <li id="number">{{ number }}</li>
          <li id="string">{{ string }}</li>
        </ul>
      `
    );

    mount(html`<${name}></${name}>`);

    assert.equal($('#boolean').textContent, 'false');
    assert.equal($('#undefined').textContent, '');
    assert.equal($('#null').textContent, '');
    assert.equal($('#number').textContent, '0');
    assert.equal($('#string').textContent, 'string');
  });

  it('should support multiple bindings', () => {
    let name = createName();

    let view = {
      c1: 'red',
      c2: 'green',
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html` <p>{{c1}} + {{c2}}</p> `
    );

    mount(html`<${name}></${name}>`);

    assert.equal($('p').textContent, 'red + green');
  });

  it('should apply all the values', () => {
    let name = createName();

    let view = {
      classes: ['one', 'two', 'three'],
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html`<section class="{{classes}}"></section>`
    );

    mount(html`<${name}></${name}>`);

    assert.equal($('section').className, 'one two three');
  });

  it('should apply all the keys with truthy values', () => {
    let name = createName();

    let view = {
      classes: {
        one: true,
        two: false,
        three: {},
        four: null,
        five: '',
        six: 'ok',
      },
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html` <section class="{{classes}}"></section> `
    );

    mount(html`<${name}></${name}>`);

    assert.equal($('section').className, 'one three six');
  });

  it('should apply styles', () => {
    let name = createName();

    let view = {
      foo: `
        background-color: gold;
        color: tomato;
        width: 100px;
        height: 100px;
      `,
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html` <section style="{{foo}}"></section> `
    );

    mount(html`<${name}></${name}>`);

    assert.equal(
      $('section').getAttribute('style'),
      'background-color: gold; color: tomato; width: 100px; height: 100px;'
    );
  });

  it('should preserve browser styles', async () => {
    let name = createName();

    let view = {
      foo: `
      background-color: gold;
      color: tomato;
      width: 100px;
      height: 100px;
      `,
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html` <section style="{{foo}}"></section> `,
      {
        observe: ['foo'],
      }
    );

    mount(html`<${name}></${name}>`);

    $('section').style.opacity = '0.5';

    assert.ok($('section').getAttribute('style').includes('background-color: gold;'));

    $(name).foo = `
      background-color: tomato;
      color: gold;
      width: 100px;
      height: 100px;
  `;

    await nextFrame();

    assert.ok($('section').getAttribute('style').includes('background-color: tomato;'));

    assert.ok($('section').getAttribute('style').includes('opacity: 0.5;'));
  });

  it('should apply styles (Object / kebab)', () => {
    let name = createName();

    let view = {
      foo: {
        'background-color': 'gold',
        color: 'tomato',
        width: '100px',
        height: '100px',
      },
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html` <section style="{{foo}}"></section> `
    );

    mount(html`<${name}></${name}>`);

    assert.equal(
      $('section').getAttribute('style'),
      'background-color: gold; color: tomato; width: 100px; height: 100px;'
    );
  });

  it('should apply styles (Object / pascal)', () => {
    let name = createName();

    let view = {
      foo: {
        backgroundColor: 'gold',
        color: 'tomato',
        width: '100px',
        height: '100px',
      },
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html` <section style="{{foo}}"></section> `
    );

    mount(html`<${name}></${name}>`);

    assert.equal(
      $('section').getAttribute('style'),
      'background-color: gold; color: tomato; width: 100px; height: 100px;'
    );
  });

  it('should allow whitespace formatting', () => {
    let name = createName();

    let view = {
      c1: 'red',
      c2: 'green',
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html` <p name="{{ c1 }}">{{ c2 }}</p> `
    );

    mount(html`<${name}></${name}>`);

    assert.equal($('p').getAttribute('name'), 'red');
    assert.equal($('p').textContent, 'green');
  });

  it('should support negation', async () => {
    let name = createName();

    let view = { foo: true };

    synergy.define(
      name,
      () => {
        return view;
      },
      html` <p hidden="{{ !foo }}">boo!</p>`,
      {
        observe: ['foo'],
      }
    );

    mount(html`<${name}></${name}>`);

    assert.notOk($('p').hidden);

    $(name).foo = false;

    await nextFrame();

    assert.ok($('p').hidden);
  });

  it('should support square brackets', () => {
    let name = createName();

    let view = {
      columns: ['one', 'two', 'three'],
      rows: [
        {
          one: 1,
          two: 2,
          three: 3,
        },
        {
          one: 3,
          two: 2,
          three: 1,
        },
        {
          one: 1,
          two: 3,
          three: 2,
        },
      ],
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html`
        <table>
          <template each="column in columns">
            <th>{{ column }}</th>
          </template>
          <template each="row in rows">
            <tr>
              <template each="column in columns">
                <td>{{ row[column] }}</td>
              </template>
            </tr>
          </template>
        </table>
      `
    );

    mount(html`<${name}></${name}>`);

    assert.equal($$('th').length, 3);
    assert.equal($$('tr').length, 3);
    assert.deepEqual(
      $$('tr').map((v) => v.textContent.trim()),
      ['123', '321', '132']
    );
  });

  it('should support function invocation', () => {
    let name = createName();

    let view = {
      items: [1, 2, 3],
      isSecond(item) {
        return item === this.items[1] ? 'page' : null;
      },
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html`
        <ul>
          <template each="item in items">
            <li><a aria-current="{{ isSecond(item) }}"></a></li>
          </template>
        </ul>
      `
    );

    mount(html`<${name}></${name}>`);

    assert.equal($$('a[aria-current="page"]').length, 1);
  });

  it('should support nested function invocation', () => {
    let name = createName();

    let view = {
      foo: {
        items: [1, 2, 3],
        isSecond(item) {
          return item === this.items[1] ? 'page' : null;
        },
      },
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html`
        <ul>
          <template each="item in foo.items">
            <li><a aria-current="{{ foo.isSecond(item) }}"></a></li>
          </template>
        </ul>
      `
    );

    mount(html`<${name}></${name}>`);

    assert.equal($$('a[aria-current="page"]').length, 1);
  });
});
