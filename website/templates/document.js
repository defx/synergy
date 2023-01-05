import { html } from "../utils.js"

export const documentTemplate = ({
  title,
  headContent = "",
  mainContent = "",
  mainNavigation = "",
}) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      ${title && `<title>${title}</title>`} ${headContent}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/base16/tomorrow.min.css"
        integrity="sha512-5D/fcZ3y3nuaeHSxDbFwWDEy1Fvj5qQKsU0tilD7bhWAA+IN/Jl9fzGdUotzvA7wgXtsnZmafcuunH+6nyuA0A=="
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
      />
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          line-height: 1.5;
        }

        html {
          --khaki-web: #b7ad99;
          --timberwolf: #d7d9ce;
          --primary: #63768d;
          --illuminating-emerald: #1a936f;
          --slate-grey: #63768d;
          --fire-opal: #eb5e55;
        }

        body {
          background-color: #fafafa;
          font-family: Georgia, "Times New Roman", Times, serif;

          color: rgb(81, 81, 81);
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
          padding: 1rem;
          width: 100%;
          max-width: 768px;
        }

        main ul {
          margin: 0 1rem;
        }

        li + li {
          margin-top: 1rem;
        }

        blockquote {
          padding: 2rem;
          font-style: italic;
          background: #eaeaea;
        }

        h1 {
          font-size: 2rem;
        }

        h2 {
          font-size: 1.6rem;

          margin: 2rem 0 1rem;
        }

        h3 {
          font-size: 1.1rem;
        }

        p {
          margin: 1rem 0;
        }

        code {
          font-size: 0.875rem;
        }

        .wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        #sidebar {
          background-color: var(--primary);
          color: white;
        }

        #sidebar a {
          color: white;
        }

        .large-screen {
          display: none;
        }

        @media screen and (min-width: 960px) {
          .small-screen {
            display: none;
          }

          .large-screen {
            display: initial;
          }

          #sidebar {
            width: 280px;
            height: 100vh;
            position: sticky;
            top: 0;
            overflow-y: scroll;
            border-right: 1px solid rgba(0, 128, 128, 0.25);
          }

          .wrapper {
            flex-direction: row;
            justify-content: initial;
          }
          a[href="/docs"] {
            display: none;
          }
        }
      </style>
      <style>
        x-hero {
          padding: 2rem 0;
          display: block;
          text-align: center;
        }
        ul {
          padding: 1rem;
          list-style-type: none;
        }
        li {
          line-height: 2;
        }
        strong {
          color: var(--primary);
        }

        .hljs {
          overflow-y: scroll;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div id="sidebar">
          <header>
            <h1><a href="/">Synergy JS</a></h1>
            <h2>The tiny runtime library for crafting Web Components.</h2>
            <!--<a href="/docs" class="lso">docs</a>-->
          </header>
          ${mainNavigation}
        </div>
        <main>${mainContent}</main>
      </div>
    </body>
  </html>
`
