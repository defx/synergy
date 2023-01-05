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

        html {
          height: -webkit-fill-available;
        }

        body {
          background-color: #fafafa;
          font-family: serif;
          color: rgb(81, 81, 81);
          font-size: 1.1rem;
          min-height: 100vh;
          min-height: -webkit-fill-available;
        }

        #sidebar,
        main {
          padding: 1.5rem;
        }

        main {
          width: 100%;
          max-width: 768px;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        .strap {
          /* Change heading typefaces here */
          font-family: sans-serif;
          margin-top: 1.5rem;
          margin-bottom: 0;
          line-height: 1.5rem;
        }

        h1 {
          font-size: 4.242rem;
          line-height: 4.5rem;
          margin-top: 3rem;
        }

        .strap {
          font-size: 2.828rem;
          line-height: 3rem;
          margin-top: 3rem;
        }

        h2 {
          font-size: 1.414rem;
        }
        h4 {
          font-size: 0.707rem;
        }
        h5 {
          font-size: 0.4713333333333333rem;
        }
        h6 {
          font-size: 0.3535rem;
        }

        p {
          line-height: 1.5rem;
          margin: 1.5rem 0;
        }

        ul,
        ol {
          list-style-type: none;
          margin: 1.5rem 0;
        }

        li {
          line-height: 1.5rem;
          margin: 1.5rem 0;
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
            max-width: 32vw;
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
            <h1><a href="/">Synergy</a></h1>
            <div class="strap">
              The tiny runtime library for crafting Web Components.
            </div>
          </header>
          ${mainNavigation}
        </div>
        <main>${mainContent}</main>
      </div>
    </body>
  </html>
`
