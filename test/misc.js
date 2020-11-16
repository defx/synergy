describe('misc', () => {
  it('should work with shadow DOM and slots', async () => {
    let v1, v2;
    class X extends HTMLElement {
      constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        v1 = synergy.render(
          shadowRoot,
          {
            message: 'hello world',
          },
          html`<button>{{ message }} <slot></slot></button>`
        );
      }
    }
    customElements.define('x-x', X);

    let rootNode = mount(html`<div id="container"></div>`);

    v2 = synergy.render(
      rootNode,
      { message: 'Ciao mondo!' },
      html` <x-x>{{ message }}</x-x> `
    );

    v1.message = 'Helló Világ!';
    v2.message = 'こんにちは世界！';

    await nextUpdate();

    assert.equal(
      rootNode.querySelector('x-x').shadowRoot.querySelector('button')
        .textContent,
      'Helló Világ!'
    );

    assert.equal(rootNode.querySelector('x-x').textContent, 'こんにちは世界！');
  });
});
