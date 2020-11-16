import hydrate from '../src/hydrate.js';

const nodeFromString = (str) => {
  var tpl = document.createElement('template');
  tpl.innerHTML = str;
  return tpl.cloneNode(true).content;
};

describe('hydrate', () => {
  it('should return falsy if target node is empty', () => {
    let sourceNode = nodeFromString(html`<p>hello world!</p>`);
    let targetNode = document.createElement('div');
    let shouldHydrate = hydrate(1, sourceNode, targetNode);
    assert.notOk(shouldHydrate);
  });

  it('should return truthy if target node and source node have matching content', () => {
    const bindingId = 1;
    //prepare sourceNode with bindings
    let sourceNode = nodeFromString(html`<p>hello world!</p>`);
    let targetNode = nodeFromString(html`<p>hello world!</p>`);
    let shouldHydrate = hydrate(bindingId, sourceNode, targetNode);
    assert.ok(shouldHydrate);
  });

  it('should add bindings when hydrating', () => {
    const bindingId = 1;
    const bindings = [{ foo: 'bar' }];
    //prepare sourceNode with bindings
    let sourceNode = nodeFromString(html`<p>hello world!</p>`);
    let paragraph = sourceNode.firstElementChild;
    paragraph.bindingId = bindingId;
    paragraph.__bindings__ = bindings;
    let targetNode = nodeFromString(html`<p>hello world!</p>`);
    hydrate(bindingId, sourceNode, targetNode);
    assert.deepEqual(
      targetNode.firstElementChild.__bindings__,
      sourceNode.firstElementChild.__bindings__
    );
  });

  it('should ignore slotted content', () => {
    const bindingId = 1;
    //prepare sourceNode with bindings
    let sourceNode = nodeFromString(
      html`<p>hello world!</p>
        <slot></slot>`
    );
    let targetNode = nodeFromString(
      html`<p>hello world!</p>
        fa la la`
    );
    let shouldHydrate = hydrate(bindingId, sourceNode, targetNode);
    assert.ok(shouldHydrate);
  });

  it('should ignore minor text differences (could be slotted text)', () => {
    const bindingId = 1;
    //prepare sourceNode with bindings
    let sourceNode = nodeFromString(html`<p>hello world!</p>`);
    let targetNode = nodeFromString(html`<p>hello world!fa la la</p>`);
    let shouldHydrate = hydrate(bindingId, sourceNode, targetNode);
    assert.ok(shouldHydrate);
  });

  it('should acknowledge major text differences (cant be slotted text)', () => {
    const bindingId = 1;
    //prepare sourceNode with bindings
    let sourceNode = nodeFromString(html`<p>hello world!</p>`);
    let targetNode = nodeFromString(html`<p>ওহে বিশ্ব!</p>`);
    let shouldHydrate = hydrate(bindingId, sourceNode, targetNode);
    assert.notOk(shouldHydrate);
  });
});
