describe('hydrate', () => {
  it('should preserve prerendered DOM', () => {
    let name = createName();

    let stack = [];

    synergy.define(
      name,
      () => {
        return {
          foo() {
            stack.push('foo!');
          },
        };
      },
      html`
        <div>
          <a href="#" id="foo" onclick="foo()"><slot></slot></a>
        </div>
      `
    );

    mount(html`<${name}>click me!</${name}>`);

    let outerHTML = $(name).outerHTML;

    let newNode = document.createElement('div');
    newNode.innerHTML = outerHTML;

    mount(newNode);

    let anchor1 = newNode.querySelector('#foo');
    let anchor2 = document.querySelector('#foo');

    assert.ok(anchor1.isSameNode(anchor2));

    anchor2.click();

    assert.deepEqual(stack, ['foo!']);
  });
});
