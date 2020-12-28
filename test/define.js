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
    synergy.define(
      name,
      factory,
      '<p>{{ title }}</p>'
    );
    mount(`
      <${name} title="ok!"></${name}>
      `);
    let el = document.querySelector(name);
    assert.equal(
      el.querySelector('p').textContent,
      'ok!'
    );
  });
  it('should use template with id matching element name if no string template is provided', () => {
    let name = `x-${count++}`;
    let factory = ({ title }) => ({ title });
    let template = document.createElement(
      'template'
    );
    template.innerHTML = '<p>{{ title }}</p>';
    template.id = name;
    document.body.appendChild(template);
    synergy.define(name, factory);
    mount(`
      <${name} title="ok!"></${name}>
      `);
    let el = document.querySelector(name);
    assert.equal(
      el.querySelector('p').textContent,
      'ok!'
    );
  });
  it('should reflect attribute changes on to viewmodel', async () => {
    let name = `x-${count++}`;
    let factory = ({ title }) => ({
      title,
    });
    synergy.define(
      name,
      factory,
      '<p>{{ title }}</p>'
    );
    mount(`
      <${name} title="ok!"></${name}>
      `);
    document
      .querySelector(name)
      .setAttribute('title', 'foo!');
    await nextFrame();
    assert.equal(
      document.querySelector(`${name} p`)
        .textContent,
      'foo!'
    );
  });
  it('should reflect viewmodel changes back on to attributes', async () => {
    let name = `x-${count++}`;
    let factory = ({ hidden = true }) => ({
      hidden,
      toggle() {
        this.hidden = !this.hidden;
      },
    });
    synergy.define(
      name,
      factory,
      '<p hidden={{ hidden }}>hello world!</p><button onclick="toggle">toggle</button>'
    );
    mount(`
      <${name}></${name}>
      `);
    document
      .querySelector(`${name} button`)
      .click();
    await nextFrame();
    let el = document.querySelector(name);
    assert.equal(
      el.hasAttribute('hidden'),
      false
    );
  });
  it('should extract style element, prefix selectors with type selector and append styles to document head', () => {
    let name = `x-${count++}`;
    let factory = () => ({});
    synergy.define(
      name,
      factory,
      html`
        <style scoped>
          button,
          p {
            all: inherit;
          }
        </style>
        <p>Hello world!</p>
      `
    );
    mount(`
          <${name}></${name}>
          `);

    let el = document.querySelector(name);
    let style = document.querySelector(
      `head style[id="elementary-${name}"]`
    );

    assert.equal(
      style.textContent
        .trim()
        .replace(/\s+/g, ' '),
      `${name} button, ${name} p { all: inherit; }`
    );
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
    assert.equal(
      el.innerHTML.trim(),
      'hello world!'
    );
  });

  it('should merge named slots', () => {
    let name = `x-${count++}`;
    let factory = () => ({});
    synergy.define(
      name,
      factory,
      html`<slot name="foo"></slot
        ><slot name="bar"></slot
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
});
