describe("define", () => {
  it("should define a custom element", () => {
    let name = createName();
    synergy.define(name, () => {}, "");
    assert.ok(customElements.get(name));
  });

  it("should initialise factory with initial attributes", () => {
    let name = createName();
    let factory = ({ title }) => ({ title });
    synergy.define(name, factory, "<p>{{ title }}</p>");
    mount(`
      <${name} title="ok!"></${name}>
      `);
    let el = document.querySelector(name);
    assert.equal(el.querySelector("p").textContent, "ok!");
  });

  it("should accept template element", () => {
    let name = createName();
    let factory = ({ title }) => ({ title });
    let template = document.createElement("template");
    template.innerHTML = "<p>{{ title }}</p>";
    synergy.define(name, factory, template);
    mount(`
      <${name} title="ok!"></${name}>
      `);
    let el = document.querySelector(name);
    assert.equal(el.querySelector("p").textContent, "ok!");
  });

  it("should reflect attribute changes on to viewmodel", async () => {
    let name = createName();
    let factory = ({ title }) => ({
      title,
    });
    synergy.define(name, factory, "<p>{{ title }}</p>", {
      observe: ["title"],
    });
    mount(`
      <${name} title="ok!"></${name}>
      `);
    document.querySelector(name).setAttribute("title", "foo!");
    await nextFrame();
    assert.equal(document.querySelector(`${name} p`).textContent, "foo!");
  });
  it("should reflect viewmodel changes back on to attributes", async () => {
    let name = createName();
    let factory = ({ show }) => ({
      show,
      toggle() {
        this.show = !this.show;
      },
    });
    synergy.define(
      name,
      factory,
      '<p hidden="{{ !show }}">hello world!</p><button onclick="toggle()">toggle</button>',
      {
        observe: ["show"],
      }
    );
    mount(`
      <${name}></${name}>
      `);
    document.querySelector(`${name} button`).click();
    await nextFrame();
    let el = document.querySelector(name);
    assert.ok(el.hasAttribute("show"));
  });

  it("should merge default slot", () => {
    let name = createName();
    let factory = () => ({});
    synergy.define(
      name,
      factory,
      html`<p>hello <slot></slot>!</p>
        !`
    );
    mount(`
          <${name}>world</${name}>
          `);

    assert.equal($(`${name} p`).innerText.trim(), "hello world!");
  });

  it("should merge named slots", () => {
    let name = createName();
    let factory = () => ({});
    synergy.define(
      name,
      factory,
      html`<p>
        <slot name="foo"></slot><slot name="bar"></slot><slot>hello</slot>
      </p>`
    );
    mount(`
          <${name}><span slot="foo">!</span></${name}>
          `);

    assert.equal($(`${name} p`).innerHTML.trim(), "<span>!</span>hello");
  });

  it("should convert between kebab and pascal casing", async () => {
    let name = createName();
    let factory = ({ fooBar }) => ({
      fooBar,
      toggle() {
        this.fooBar = !this.fooBar;
      },
    });
    synergy.define(
      name,
      factory,
      html`<button onclick="toggle()">ok</button>`,
      {
        observe: ["foo-bar"],
      }
    );
    mount(`
    <${name} foo-bar></${name}>
    `);

    assert.equal($(name).getAttribute("foo-bar"), "");

    $("button").click();
    await nextFrame();

    assert.equal($(`${name}`).hasAttribute("foo-bar"), false);
  });

  it("should account for aria string booleans", async () => {
    let name = createName();
    let factory = ({ ariaHidden = false }) => ({
      ariaHidden,
      toggle() {
        this.ariaHidden = !this.ariaHidden;
      },
    });
    synergy.define(
      name,
      factory,
      html`<button onclick="toggle()">ok</button>`,
      {
        observe: ["aria-hidden"],
      }
    );
    mount(`
    <${name} aria-hidden="false"></${name}>
    `);

    $("button").click();
    await nextFrame();
    assert.equal($(`${name}`).getAttribute("aria-hidden"), "true");
  });

  it("should forward lifecycle events", () => {
    let name = createName();

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
    synergy.define(name, factory, "<template></template>");
    mount(`
    <${name}></${name}>
    `);
    assert.ok(connected);
    assert.notOk(disconnected);
    document.querySelector(name).remove();
    assert.ok(disconnected);
  });

  it("should optionally support shadow root", () => {
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

    synergy.define("x-shadow", factory, template, {
      shadow: "open",
    });

    mount(html`<x-shadow>hello shadow</x-shadow>`);

    let node = document.querySelector("x-shadow");

    assert.ok(node.shadowRoot);
  });

  it("should accept rich data as properties", () => {
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

    synergy.define("rich-props", factory, template, {
      observe: ["arr", "obj"],
    });

    let name = createName();

    synergy.define(
      name,
      () => {
        return {
          letters: "synergy".split(""),
          library: {
            org: "synergyjs",
            repo: "defx/synergy",
          },
        };
      },
      html` <rich-props arr="{{ letters }}" obj="{{ library }}"></rich-props> `
    );

    mount(html`<${name}></${name}>`);
  });

  it("should reflect observed properties from viewmodel to element", async () => {
    let name = createName();

    synergy.define(
      name,
      ({ foo }) => {
        return {
          foo,
          updateFoo() {
            this.foo = "baz";
          },
        };
      },
      html` <p onclick="updateFoo()" foo="bar">{{ foo }}</p> `
    );

    mount(`<${name}></${name}>`);

    $(`${name} p`).click();

    await nextFrame();

    assert.equal($(name).foo, "baz");
  });

  it("should support async initialisation", async () => {
    let name = createName();

    synergy.define(
      name,
      () =>
        Promise.resolve().then(() => {
          return {
            foo: "bar",
          };
        }),
      html` <p>{{ foo }}</p> `
    );

    mount(`<${name}></${name}>`);

    assert.ok($(name));
    assert.equal($(name).textContent.trim(), "");

    await nextFrame();
    assert.equal($(name).innerText.trim(), "bar");
  });
});
