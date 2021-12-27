describe("hydrate", () => {
  it("should preserve prerendered DOM", () => {
    let name = createName();

    let stack = [];

    synergy.define(
      name,
      () => {
        return {
          foo() {
            stack.push("foo!");
          },
        };
      },
      html`
        <div>
          <a href="#" id="foo" :onclick="foo()"><slot></slot></a>
        </div>
      `
    );

    mount(html`<${name}>click me!</${name}>`);

    let outerHTML = $(name).outerHTML;

    $(name).parentNode.removeChild($(name));

    let newNode = document.createElement("div");
    newNode.innerHTML = outerHTML;

    mount(newNode);

    $("#foo").click();

    assert.deepEqual(stack, ["foo!"]);
  });
});
