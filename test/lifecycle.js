describe('updateCallback lifecycle event', () => {
  it('should fire after update', async () => {
    mount(html` <div id="container"></div> `);

    let stack = [];

    let view = synergy.render(
      document.getElementById('container'),
      {
        message: 'hi!',
        updatedCallback(prevState) {
          stack.push(true);
        },
      },
      html`<p>{{message}}</p>`
    );

    assert.equal(stack.length, 0);

    view.message = 'bye!';

    await nextFrame();

    assert.equal(stack.length, 1);
  });
  it('should provide previous state', async () => {
    mount(html` <div id="container"></div> `);

    let stack = [];

    let view = synergy.render(
      document.getElementById('container'),
      {
        message: 'hi!',
        updatedCallback(prevState) {
          stack.push(prevState.message);
        },
      },
      html`<p>{{message}}</p>`
    );

    assert.equal(stack.length, 0);

    view.message = 'bye!';

    await nextFrame();

    assert.equal(stack.length, 1);

    assert.equal(stack[0], 'hi!');
  });
  it('should have correct thisArg', async () => {
    mount(html` <div id="container"></div> `);

    let stack = [];

    let view = synergy.render(
      document.getElementById('container'),
      {
        message: 'hi!',
        updatedCallback(prevState) {
          stack.push({
            prev: prevState.message,
            next: this.message,
          });
        },
      },
      html`<p>{{message}}</p>`
    );

    assert.equal(stack.length, 0);

    view.message = 'bye!';

    await nextFrame();

    assert.equal(stack.length, 1);

    assert.deepEqual(stack[0], {
      prev: 'hi!',
      next: 'bye!',
    });
  });
});
