describe('render', () => {
  it('should support nested trees', async () => {
    mount(html` <div id="container"></div> `);

    let view1 = synergy.render(
      document.getElementById('container'),
      {
        greeting: 'hi!',
        farewell: 'bye!',
      },
      html`<p>{{greeting}}</p>
        <div id="container2"></div>
        <p>{{farewell}}</p>`
    );

    let view2 = synergy.render(
      document.getElementById('container2'),
      {
        greeting: '¡Hola!',
        farewell: 'adiós!',
      },
      html`<p>{{greeting}}</p>
        <p>{{farewell}}</p>`
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
