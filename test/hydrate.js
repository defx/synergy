describe('hydrate', () => {
  let view, rootNode, $$, $;
  beforeEach(() => {
    rootNode = mount(html`<div id="container"></div>`);
    $$ = (x) => Array.from(rootNode.querySelectorAll(x));
    $ = (x) => rootNode.querySelector(x);
  });

  it('should not replace the DOM', async () => {
    rootNode = mount(html`<div id="container"></div>`);
    synergy.render(
      rootNode,
      {
        message: 'hello world',
      },
      html` <p class="message">{{message}}</p> `
    );

    let htmlContent = rootNode.innerHTML;

    rootNode.innerHTML = htmlContent; //erase bindings and listeners

    let textNode = rootNode.querySelector('p.message').firstChild;

    let view = synergy.render(
      rootNode,
      {
        message: 'hello world',
      },
      html` <p class="message">{{message}}</p> `
    );

    //prove that the second render hasn't replaced the DOM

    assert.ok(
      textNode.isSameNode(rootNode.querySelector('p.message').firstChild)
    );

    //check that things are still working as expected...

    view.message = 'ok!';

    await nextUpdate();
    assert.equal(textContent(textNode), 'ok!');
  });
});
