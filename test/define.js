describe("define", () => {
  let count = 0;

  it("should define a custom element", () => {
    let name = `x-${count++}`;
    synergy.define(name, () => {}, "");
    assert.ok(customElements.get(name));
  });
  it("should initialise factory with initial attributes", () => {
    let name = `x-${count++}`;
    let factory = ({ title }) => ({ title });
    synergy.define(name, factory, "<p>{{ title }}</p>");
    mount(`
      <${name} title="ok!"></${name}>
      `);
    let el = document.querySelector(name);
    assert.equal(el.querySelector("p").textContent, "ok!");
  });

  it("should reflect attribute changes on to viewmodel", async () => {
    let name = `x-${count++}`;
    let factory = ({ title }) => ({
      title,
    });
    synergy.define(name, factory, "<p>{{ title }}</p>", {
      observedAttributes: ["title"],
    });
    mount(`
      <${name} title="ok!"></${name}>
      `);
    document.querySelector(name).setAttribute("title", "foo!");
    await nextFrame();
    assert.equal(
      document.querySelector(`${name} p`).textContent,
      "foo!"
    );
  });
  it("should reflect viewmodel changes back on to attributes", async () => {
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
      '<p hidden={{ hidden }}>hello world!</p><button onclick="toggle">toggle</button>',
      {
        observedAttributes: ["hidden"],
      }
    );
    mount(`
      <${name}></${name}>
      `);
    document.querySelector(`${name} button`).click();
    await nextFrame();
    let el = document.querySelector(name);
    assert.equal(el.hasAttribute("hidden"), false);
  });
  it("should extract style element, prefix selectors with type selector and append styles to document head", () => {
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
      `head style[id="synergy-${name}"]`
    );

    assert.equal(
      style.textContent.trim().replace(/\s+/g, " "),
      `${name} button, ${name} p { all: inherit; }`
    );
  });

  it("should merge default slot", () => {
    let name = `x-${count++}`;
    let factory = () => ({});
    synergy.define(name, factory, html`hello <slot></slot>!`);
    mount(`
          <${name}>world</${name}>
          `);

    let el = document.querySelector(name);
    assert.equal(el.innerHTML.trim(), "hello world!");
  });

  it("should merge named slots", () => {
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
    assert.equal(el.innerHTML.trim(), "<span>!</span>hello");
  });

  it("should convert between kebab and pascal casing", async () => {
    let name = `x-${count++}`;
    let factory = ({ fooBar = false }) => ({
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
        observedAttributes: ["foo-bar"],
      }
    );
    mount(`
    <${name} foo-bar></${name}>
    `);

    assert.equal($(`${name}`).getAttribute("foo-bar"), "");

    $("button").click();
    await nextFrame();
    assert.equal($(`${name}`).hasAttribute("foo-bar"), false);
  });

  it("should account for aria string booleans", async () => {
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
        observedAttributes: ["aria-hidden"],
      }
    );
    mount(`
    <${name} aria-hidden="false"></${name}>
    `);

    $("button").click();
    await nextFrame();
    assert.equal($(`${name}`).getAttribute("aria-hidden"), "true");
  });
});
