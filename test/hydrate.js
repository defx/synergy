import hydrate from '../src/hydrate.js';

const nodeFromString = (str) => {
  var tpl = document.createElement('template');
  tpl.innerHTML = str;
  return tpl.cloneNode(true).content;
};

describe('hydrate', () => {
  it('should return falsy if target node is empty', () => {
    let sourceNode = nodeFromString(
      html`<p>hello world!</p>`
    );
    let targetNode = document.createElement('div');
    let shouldHydrate = hydrate(1, sourceNode, targetNode);
    assert.notOk(shouldHydrate);
  });

  it('should return truthy if target node and source node have matching content', () => {
    const bindingId = 1;
    //prepare sourceNode with bindings
    let sourceNode = nodeFromString(
      html`<p>hello world!</p>`
    );
    let targetNode = nodeFromString(
      html`<p>hello world!</p>`
    );
    let shouldHydrate = hydrate(
      bindingId,
      sourceNode,
      targetNode
    );
    assert.ok(shouldHydrate);
  });

  it('should return falsy if target node and source node do not have matching content', () => {
    const bindingId = 1;
    //prepare sourceNode with bindings
    let sourceNode = nodeFromString(
      html`<p>hello world!</p>`
    );
    let targetNode = nodeFromString(
      html`<b>hello world!</b>`
    );
    let shouldHydrate = hydrate(
      bindingId,
      sourceNode,
      targetNode
    );
    assert.notOk(shouldHydrate);
  });

  it('should add bindings when hydrating', () => {
    const bindingId = 1;
    const bindings = [{ foo: 'bar' }];
    //prepare sourceNode with bindings
    let sourceNode = nodeFromString(
      html`<p>hello world!</p>`
    );
    let paragraph = sourceNode.firstElementChild;
    paragraph.bindingId = bindingId;
    paragraph.__bindings__ = bindings;
    let targetNode = nodeFromString(
      html`<p>hello world!</p>`
    );
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
    let shouldHydrate = hydrate(
      bindingId,
      sourceNode,
      targetNode
    );
    assert.ok(shouldHydrate);
  });

  it('should ignore minor text differences (could be slotted text)', () => {
    const bindingId = 1;
    //prepare sourceNode with bindings
    let sourceNode = nodeFromString(
      html`<p>hello world!</p>`
    );
    let targetNode = nodeFromString(
      html`<p>hello world!fa la la</p>`
    );
    let shouldHydrate = hydrate(
      bindingId,
      sourceNode,
      targetNode
    );
    assert.ok(shouldHydrate);
  });

  it('should hydrate all of the things', async () => {
    mount(html`
      <div id="app-container">
        <template each="item in items">
          <x-drawer
            title="{{ item.name }}"
            open="{{ item.open }}"
          >
            <p>hi, my name is {{ item.name }}</p>
          </x-drawer>
        </template>
        <x-drawer open="" title="kim">
          <h3>
            <button aria-expanded="true">kim</button>
          </h3>
          <div>
            <p>hi, my name is kim</p>
          </div>
        </x-drawer>
        <x-drawer open="" title="thea">
          <h3>
            <button aria-expanded="true">thea</button>
          </h3>
          <div>
            <p>hi, my name is thea</p>
          </div>
        </x-drawer>
        <x-drawer open="" title="ericka">
          <h3>
            <button aria-expanded="true">ericka</button>
          </h3>
          <div>
            <p>hi, my name is ericka</p>
          </div>
        </x-drawer>
      </div>
    `);

    let drawersBefore = $$('x-drawer');

    (() => {
      let factory = ({ title = '', open }, element) => {
        return {
          open,
          title,
          toggle() {
            this.open = !this.open;
          },
        };
      };

      synergy.define(
        'x-drawer',
        factory,
        html`<h3>
            <button
              onclick="toggle"
              aria-expanded="{{ open }}"
            >
              {{ title }}
            </button>
          </h3>
          <div hidden="{{ !open }}">
            <slot></slot>
          </div>`,
        { observedAttributes: ['open'] }
      );
    })();

    (() => {
      let factory = () => {
        let SSR = false;

        return {
          items: [
            { name: 'kim', open: true },
            { name: 'thea', open: SSR },
            { name: 'ericka', open: SSR },
          ],
        };
      };

      synergy.render(
        document.getElementById('app-container'),
        factory(),
        html`<template each="item in items">
          <x-drawer
            title="{{ item.name }}"
            open="{{ item.open }}"
          >
            <p>hi, my name is {{ item.name }}</p>
          </x-drawer>
        </template>`
      );
    })();

    let drawersAfter = $$('x-drawer');

    let sameNodes = drawersAfter.every((drawer, i) =>
      drawer.isSameNode(drawersBefore[i])
    );

    assert.ok(sameNodes);

    assert.equal(
      drawersAfter[0].hasAttribute('open'),
      true
    );
    assert.equal(
      drawersAfter[1].hasAttribute('open'),
      false
    );
    assert.equal(
      drawersAfter[2].hasAttribute('open'),
      false
    );

    drawersAfter[1].querySelector('button').click();

    await nextFrame();

    assert.ok(drawersAfter[1].hasAttribute('open'));
  });
});
