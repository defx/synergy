describe('hydrate', () => {
  // let view, rootNode, $$, $;
  // beforeEach(() => {
  //   rootNode = mount(html`<div id="container"></div>`);
  //   $$ = (x) => Array.from(rootNode.querySelectorAll(x));
  //   $ = (x) => rootNode.querySelector(x);
  // });

  it('should not replace the DOM', async () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <p>{{message}}</p>
      </template>
    `);

    let node = document.getElementById('container');

    synergy.render(
      node,
      {
        message: 'hello world',
      },
      'x-template'
    );

    let htmlContent = node.innerHTML;

    node.innerHTML = htmlContent; //erase bindings and listeners

    let textNode = $('#container p').firstChild;

    let view = synergy.render(
      node,
      {
        message: 'hello world',
      },
      'x-template'
    );

    assert.equal(node.innerHTML, htmlContent);

    //prove that the second render hasn't replaced the DOM

    console.log(textNode, $('#container p').firstChild);

    assert.ok(textNode.isSameNode($('#container p').firstChild));

    //check that things are still working as expected...

    view.message = 'ok!';

    await nextUpdate();
    // assert.equal(textNode.textContent, 'ok!');
  });
});
