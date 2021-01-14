describe('define', () => {
  let count = 0;

  it('should define a custom element', () => {
    let name = `x-${count++}`;
    synergy.define(name, () => {}, '');
    assert.ok(customElements.get(name));
  });

  it('should initialise factory with initial attributes', () => {
    let name = `x-${count++}`;
    let factory = ({ title }) => ({ title });
    synergy.define(name, factory, '<p>{{ title }}</p>');
    mount(`
      <${name} title="ok!"></${name}>
      `);
    let el = document.querySelector(name);
    assert.equal(el.querySelector('p').textContent, 'ok!');
  });

  it('should accept template element', () => {
    let name = `x-${count++}`;
    let factory = ({ title }) => ({ title });
    let template = document.createElement('template');
    template.innerHTML = '<p>{{ title }}</p>';
    synergy.define(name, factory, template);
    mount(`
      <${name} title="ok!"></${name}>
      `);
    let el = document.querySelector(name);
    assert.equal(el.querySelector('p').textContent, 'ok!');
  });

  it('should reflect attribute changes on to viewmodel', async () => {
    let name = `x-${count++}`;
    let factory = ({ title }) => ({
      title,
    });
    synergy.define(name, factory, '<p>{{ title }}</p>', {
      observedAttributes: ['title'],
    });
    mount(`
      <${name} title="ok!"></${name}>
      `);
    document
      .querySelector(name)
      .setAttribute('title', 'foo!');
    await nextFrame();
    assert.equal(
      document.querySelector(`${name} p`).textContent,
      'foo!'
    );
  });
  it('should reflect viewmodel changes back on to attributes', async () => {
    let name = `x-${count++}`;
    let factory = ({ show }) => ({
      show,
      toggle() {
        this.show = !this.show;
      },
    });
    synergy.define(
      name,
      factory,
      '<p hidden="{{ !show }}">hello world!</p><button onclick="toggle">toggle</button>',
      {
        observedAttributes: ['show'],
      }
    );
    mount(`
      <${name}></${name}>
      `);
    document.querySelector(`${name} button`).click();
    await nextFrame();
    let el = document.querySelector(name);
    assert.ok(el.hasAttribute('show'));
  });

  it('should merge default slot', () => {
    let name = `x-${count++}`;
    let factory = () => ({});
    synergy.define(
      name,
      factory,
      html`hello <slot></slot>!`
    );
    mount(`
          <${name}>world</${name}>
          `);

    let el = document.querySelector(name);
    assert.equal(el.innerHTML.trim(), 'hello world!');
  });

  it('should merge named slots', () => {
    let name = `x-${count++}`;
    let factory = () => ({});
    synergy.define(
      name,
      factory,
      html`<slot name="foo"></slot><slot name="bar"></slot
        ><slot>hello</slot>`
    );
    mount(`
          <${name}><span slot="foo">!</span></${name}>
          `);

    let el = document.querySelector(name);
    assert.equal(
      el.innerHTML.trim(),
      '<span>!</span>hello'
    );
  });

  it('should convert between kebab and pascal casing', async () => {
    let name = `x-${count++}`;
    let factory = ({ fooBar }) => ({
      fooBar,
      toggle() {
        this.fooBar = !this.fooBar;
      },
    });
    synergy.define(
      name,
      factory,
      html`<button onclick="toggle">ok</button>`,
      {
        observedAttributes: ['foo-bar'],
      }
    );
    mount(`
    <${name} foo-bar></${name}>
    `);

    assert.equal($(name).getAttribute('foo-bar'), '');

    $('button').click();
    await nextFrame();

    assert.equal(
      $(`${name}`).hasAttribute('foo-bar'),
      false
    );
  });

  it('should account for aria string booleans', async () => {
    let name = `x-${count++}`;
    let factory = ({ ariaHidden = false }) => ({
      ariaHidden,
      toggle() {
        this.ariaHidden = !this.ariaHidden;
      },
    });
    synergy.define(
      name,
      factory,
      html`<button onclick="toggle">ok</button>`,
      {
        observedAttributes: ['aria-hidden'],
      }
    );
    mount(`
    <${name} aria-hidden="false"></${name}>
    `);

    $('button').click();
    await nextFrame();
    assert.equal(
      $(`${name}`).getAttribute('aria-hidden'),
      'true'
    );
  });

  it('should forward lifecycle events', () => {
    let name = `x-${count++}`;

    let connected = false;
    let disconnected = false;
    let factory = () => {
      return {
        connectedCallback() {
          connected = true;
        },
        disconnectedCallback() {
          disconnected = true;
        },
      };
    };
    synergy.define(name, factory, '');
    mount(`
    <${name}></${name}>
    `);
    assert.ok(connected);
    assert.notOk(disconnected);
    document.querySelector(name).remove();
    assert.ok(disconnected);
  });

  it('should optionally support shadow root', () => {
    let factory = () => ({});

    let template = html`
      <style>
        :host {
          background-color: gold;
          color: #222;
          padding: 1rem;
        }
      </style>
      <slot></slot>
    `;

    synergy.define('x-shadow', factory, template, {
      shadowRoot: 'open',
    });

    mount(html`<x-shadow>hello shadow</x-shadow>`);

    let node = document.querySelector('x-shadow');

    assert.ok(node.shadowRoot);
    assert.equal(node.shadowRoot.innerHTML, template);
  });

  it('should accept rich data as properties', () => {
    let factory = ({ arr = [], obj = {} }) => ({
      arr,
      obj,
    });

    let template = `
    <h2>{{ obj.org }}</h2>  
    <h3>{{ obj.repo }}</h3>
      <template each="item in arr">
        <p>{{ item }}</p>
      </template>
    `;

    synergy.define('rich-props', factory, template, {
      observedAttributes: ['arr', 'obj'],
    });

    mount(html` <div id="container"></div> `);

    synergy.render(
      document.getElementById('container'),
      {
        letters: 'synergy'.split(''),
        library: {
          org: 'synergyjs',
          repo: 'defx/synergy',
        },
      },
      html`
        <rich-props
          arr="{{ letters }}"
          obj="{{ library }}"
        ></rich-props>
      `
    );
  });
});
