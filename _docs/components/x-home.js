import { define } from "../synergy.js"

import "./x-hero.js"
import "./x-app.js"

const myCounterExample = /* HTML */ `
  <my-counter></my-counter>

  <script type="module">
    import { define } from "https://unpkg.com/synergy@8.0.0"

    const name = "my-counter"

    const factory = () => ({
      state: { count: 0 },
      update: {
        increment: (state) => ({
          ...state,
          count: state.count + 1,
        }),
      },
    })

    define(name, factory, "#my-counter")
  </script>

  <template id="my-counter">
    <button :onclick="increment">Count is: {{ count }}</button>
  </template>
`

define(
  "x-home",
  () => ({ state: { myCounterExample } }),
  /* HTML */ `
    <x-app>
      <x-hero></x-hero>
      <section>
        <h2>What is Synergy?</h2>
        <p>
          Synergy is a JavaScript framework for building user interfaces. It
          combines declarative data and event binding with functional state
          management and reactive updates to allow you to build all types of
          user interface for the web, no matter how simple or complex.
        </p>
        <p>Here's a simple example:</p>
        <pre>
            <code>
                {{ myCounterExample }}
            </code>
        </pre>

        <!-- @todo: consider linking to online code editor -->

        <blockquote>
          If you want to try Synergy out then simply copy and paste the example
          above into a HTML file and load it into your browser.
        </blockquote>

        <!-- @todo: include live example -->

        <p>
          The above example demonstrates the three core features of Synergy:
        </p>
        <ul>
          <li>
            <p>
              <strong>Declarative data and event binding:</strong> Synergy
              provides a declarative template syntax that allows you to describe
              HTML output based on JavaScript state. The syntax is very simple
              and easy to learn.
            </p>
          </li>
          <li>
            <p>
              <strong>Functional state management:</strong> Synergy allows you
              to describe changes to state as individual functions that are as
              easy to reason about as they are to test.
            </p>
          </li>
          <li>
            <p>
              <strong>Reactive updates:</strong> Synergy efficiently batches
              updates to your HTML whenever your state changes
            </p>
          </li>
        </ul>
      </section>
    </x-app>
  `
)
