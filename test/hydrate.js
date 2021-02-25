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
      let factory = ({ title = '', open }) => {
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
        { observe: ['open'] }
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

  it('should hydrate with rich data', () => {
    mount(html`
      <div id="app">
        <x-accordion>
          <script type="data">
            {
              "items": [
                {
                  "title": "HTML",
                  "description": "something about HTML...",
                  "open": true
                },
                {
                  "title": "CSS",
                  "description": "something about CSS..."
                },
                {
                  "title": "JavaScript",
                  "description": "something about JavaScript..."
                }
              ]
            }
          </script>
          <ul>
            <template each="item in items">
              <li>
                <h3>
                  <button>{{ item.title }}</button>
                </h3>
                <div>{{ item.description }}</div>
              </li>
            </template>
            <li>
              <h3>
                <button
                  aria-controls="drawer__0"
                  aria-expanded="true"
                >
                  HTML
                </button>
              </h3>
              <div id="drawer__0">
                something about HTML...
              </div>
            </li>
            <li>
              <h3>
                <button aria-controls="drawer__1">
                  CSS
                </button>
              </h3>
              <div hidden="" id="drawer__1">
                something about CSS...
              </div>
            </li>
            <li>
              <h3>
                <button aria-controls="drawer__2">
                  JavaScript
                </button>
              </h3>
              <div hidden="" id="drawer__2">
                something about JavaScript...
              </div>
            </li>
          </ul>
        </x-accordion>
      </div>
    `);

    let before = $('x-accordion');

    (() => {
      let factory = ({ items = [] }) => {
        return {
          items,
          toggle(e, item) {
            item.open = !item.open;

            if (!item.open) return;

            this.items = this.items.map((v) =>
              v === item ? v : { ...v, open: false }
            );
          },
        };
      };

      synergy.define(
        'x-accordion',
        factory,
        html`
          <ul>
            <template each="item in items">
              <li>
                <h3>
                  <button
                    onclick="toggle"
                    aria-expanded="{{ item.open }}"
                    aria-controls="drawer__{{ # }}"
                  >
                    {{ item.title }}
                  </button>
                </h3>
                <div
                  id="drawer__{{ # }}"
                  hidden="{{ !item.open }}"
                >
                  {{ item.description }}
                </div>
              </li>
            </template>
          </ul>
        `,
        {
          observe: ['items'],
        }
      );
    })();

    (() => {
      let view = {
        items: [
          {
            title: 'HTML',
            description: 'something about HTML...',
            open: true,
          },
          {
            title: 'CSS',
            description: 'something about CSS...',
          },
          {
            title: 'JavaScript',
            description: 'something about JavaScript...',
          },
        ],
      };

      const app = document.getElementById('app');

      synergy.render(
        app,
        view,
        html`<x-accordion
          items="{{ items }}"
        ></x-accordion>`
      );
    })();

    let after = $('x-accordion');

    assert.ok(after.isSameNode(before));
  });

  it('should hydrate with rich data (empty array items)', () => {
    /* just to show that this is possible because primitive values will always be read from the attributes and text nodes. Need to do a little more testing before commiting to this strategy though. */

    mount(html`
      <div id="app">
        <y-accordion>
          <script type="data">
            {
              "items": [{},{},{}]
            }
          </script>
          <ul>
            <template each="item in items">
              <li>
                <h3>
                  <button>{{ item.title }}</button>
                </h3>
                <div>{{ item.description }}</div>
              </li>
            </template>
            <li>
              <h3>
                <button
                  aria-controls="drawer__0"
                  aria-expanded="true"
                >
                  HTML
                </button>
              </h3>
              <div id="drawer__0">
                something about HTML...
              </div>
            </li>
            <li>
              <h3>
                <button aria-controls="drawer__1">
                  CSS
                </button>
              </h3>
              <div hidden="" id="drawer__1">
                something about CSS...
              </div>
            </li>
            <li>
              <h3>
                <button aria-controls="drawer__2">
                  JavaScript
                </button>
              </h3>
              <div hidden="" id="drawer__2">
                something about JavaScript...
              </div>
            </li>
          </ul>
        </y-accordion>
      </div>
    `);

    let before = $('y-accordion');

    (() => {
      let factory = ({ items = [] }) => {
        return {
          items,
          toggle(e, item) {
            item.open = !item.open;

            if (!item.open) return;

            this.items = this.items.map((v) =>
              v === item ? v : { ...v, open: false }
            );
          },
        };
      };

      synergy.define(
        'y-accordion',
        factory,
        html`
          <ul>
            <template each="item in items">
              <li>
                <h3>
                  <button
                    onclick="toggle"
                    aria-expanded="{{ item.open }}"
                    aria-controls="drawer__{{ # }}"
                  >
                    {{ item.title }}
                  </button>
                </h3>
                <div
                  id="drawer__{{ # }}"
                  hidden="{{ !item.open }}"
                >
                  {{ item.description }}
                </div>
              </li>
            </template>
          </ul>
        `,
        {
          observe: ['items'],
        }
      );
    })();

    (() => {
      let view = {
        items: [
          {
            title: 'HTML',
            description: 'something about HTML...',
            open: true,
          },
          {
            title: 'CSS',
            description: 'something about CSS...',
          },
          {
            title: 'JavaScript',
            description: 'something about JavaScript...',
          },
        ],
      };

      const app = document.getElementById('app');

      synergy.render(
        app,
        view,
        html`<y-accordion
          items="{{ items }}"
        ></y-accordion>`
      );
    })();

    let after = $('y-accordion');

    assert.ok(after.isSameNode(before));
  });
});
