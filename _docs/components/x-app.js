import hljs from "https://unpkg.com/@highlightjs/cdn-assets@11.5.1/es/highlight.min.js"

import { define } from "../synergy.js"

import "./x-header.js"
import "./x-nav.js"

define(
  "x-app",
  () => ({
    state: {
      // myCounterExample: /* HTML */ `
      //   <my-counter></my-counter>
      //   <script type="module">
      //     import { define } from "https://unpkg.com/synergy@8.0.0"
      //     const name = "my-counter"
      //     const factory = () => ({
      //       state: { count: 0 },
      //       update: {
      //         increment: (state) => ({
      //           ...state,
      //           count: state.count + 1,
      //         }),
      //       },
      //     })
      //     define(name, factory, "#my-counter")
      //   </script>
      //   <template id="my-counter">
      //     <button :onclick="increment">Count is: {{ count }}</button>
      //   </template>
      // `,
    },
    connectedCallback() {
      hljs.highlightAll()
    },
  }),
  /* HTML */ `
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/base16/tomorrow.min.css"
      integrity="sha512-5D/fcZ3y3nuaeHSxDbFwWDEy1Fvj5qQKsU0tilD7bhWAA+IN/Jl9fzGdUotzvA7wgXtsnZmafcuunH+6nyuA0A=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
    <x-header> </x-header>

    <span class="wrapper">
      <x-nav></x-nav>
      <main>
        <slot></slot>
      </main>
    </span>
  `,
  /* CSS */ `
    * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    line-height: 1.5;
  }
  
  :root {
    font-size: 100%;
  }
  
  body {
    background-color: #fafafa;
    font-family: Georgia, "Times New Roman", Times, serif;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
      Helvetica, Arial, sans-serif, "Apple Color Emoji",
      "Segoe UI Emoji";
    color: hsl(180, 100%, 10%);
    font-size: 1rem;
  }
  
  main {
    padding: 1rem;
    max-width: 768px;
    margin: 0 auto;
  }
  
  main ul {
    margin: 0 2rem;
  }
  
  blockquote {
    padding: 2rem;
    font-style: italic;
    background: #eaeaea;
  }
  
  h1 {
    font-size: 3rem;
    color: hsl(180, 50%, 16%);
  }
  
  h3 {
    font-size: 1.1rem;
    color: hsl(180, 50%, 24%);
  }
  
  p {
    margin: 1rem 0;
  }  

  .wrapper {
    display: flex;
    flex-direction: row;
  }
  
  x-nav {
    display: none;
  }
  
  @media screen and (min-width: 1024px) {
    x-nav {
      display: block;
    }
  }
    `
)
