describe('lifecycle', () => {
  it('should fire after update', async () => {
    mount(html` <div id="container"></div> `);

    let stack = [];

    let name = createName();

    let view = {
      message: 'hi!',
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html`<p>{{message}}</p>`,
      {
        observe: ['message'],
        lifecycle: {
          updatedCallback() {
            stack.push(true);
          },
        },
      }
    );

    mount(html`<${name}></${name}>`);

    assert.equal(stack.length, 0);

    $(name).message = 'bye!';

    await nextFrame();

    assert.equal(stack.length, 1);
  });
  it('should provide previous state', async () => {
    let stack = [];

    let name = createName();

    let view = {
      message: 'hi!',
    };

    synergy.define(
      name,
      () => {
        return view;
      },
      html`<p>{{message}}</p>`,
      {
        observe: ['message'],
        lifecycle: {
          updatedCallback(currState, prevState) {
            stack.push(prevState.message);
          },
        },
      }
    );

    mount(html`<${name}></${name}>`);

    assert.equal(stack.length, 0);

    $(name).message = 'bye!';

    await nextFrame();

    assert.equal(stack.length, 1);

    assert.equal(stack[0], 'hi!');
  });
  it('should have correct thisArg', async () => {
    let name = createName();

    let view = {
      message: 'hi!',
    };

    let stack = [];

    synergy.define(
      name,
      () => {
        return view;
      },
      html`<p>{{message}}</p>`,
      {
        observe: ['message'],
        lifecycle: {
          updatedCallback(currState, prevState) {
            stack.push({
              prev: prevState.message,
              next: currState.message,
            });
          },
        },
      }
    );

    mount(html`<${name}></${name}>`);

    assert.equal(stack.length, 0);

    $(name).message = 'bye!';

    await nextFrame();

    assert.equal(stack.length, 1);

    assert.deepEqual(stack[0], {
      prev: 'hi!',
      next: 'bye!',
    });
  });
});
