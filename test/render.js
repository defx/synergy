describe('render', () => {
  it('should support nested trees', async () => {
    mount(html`
      <div id="container"></div>
      <template id="x-template">
        <p>{{greeting}}</p>
        <div id="container2"></div>
        <p>{{farewell}}</p>
      </template>
      <template id="y-template">
        <p>{{greeting}}</p>
        <p>{{farewell}}</p>
      </template>
    `);

    let view1 = synergy.render(
      {
        greeting: 'hi!',
        farewell: 'bye!',
      },
      'x-template',
      'container'
    );

    let view2 = synergy.render(
      {
        greeting: '¡Hola!',
        farewell: 'adiós!',
      },
      'y-template',
      'container2'
    );

    assert.equal($$('#container p')[0].textContent, 'hi!');
    assert.equal($$('#container p')[1].textContent, '¡Hola!');
    assert.equal($$('#container p')[2].textContent, 'adiós!');
    assert.equal($$('#container p')[3].textContent, 'bye!');

    view1.greeting = 'talofa!';
    view1.farewell = 'fa!';

    await nextUpdate();

    assert.equal($$('#container p')[0].textContent, 'talofa!');
    assert.equal($$('#container p')[1].textContent, '¡Hola!');
    assert.equal($$('#container p')[2].textContent, 'adiós!');
    assert.equal($$('#container p')[3].textContent, 'fa!');
  });
});
