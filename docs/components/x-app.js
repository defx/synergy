import { define } from "../synergy.js"

import "./x-header.js"
import "./x-nav.js"
import "./x-pager.js"

define(
  "x-app",
  () => ({}),
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
      <aside><x-nav></x-nav></aside>
      <main>
        <slot></slot>
        <x-pager></x-pager>
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
  html {
    height: -webkit-fill-available;
  }
  
  body {
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }
  
  main {
    padding: 1rem 2rem;
    max-width: 768px;
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
    font-size: 2rem;
    color: hsl(180, 50%, 16%);
  }

  h2 {
    font-size: 1.6rem;
    color: hsl(180, 50%, 16%);
    margin: 2rem 0 1rem
  }
  
  h3 {
    font-size: 1.1rem;
    color: hsl(180, 50%, 24%);
  }
  
  p {
    margin: 1rem 0;
  }
  
  code {
    font-size: 0.875rem
  }

  .wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center
  }
  
  aside {
    width: 280px;
    display: none;
    border-right: 1px solid rgba(0, 128, 128, 0.25);
  }
  
  @media screen and (min-width: 960px) {
    aside {
      display: block;
      height: 100vh;
      position: sticky;
      top: 0;

      overflow-y: scroll;
    }

    .wrapper {
      justify-content: initial
    }
    a[href="/docs"] {
      display: none;
    }
  }
    `
)
