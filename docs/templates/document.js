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

        :root {
          font-size: 100%;
        }

        body {
          background-color: #fafafa;
          font-family: Georgia, "Times New Roman", Times, serif;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica,
            Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
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
          margin: 2rem 0 1rem;
        }

        h3 {
          font-size: 1.1rem;
          color: hsl(180, 50%, 24%);
        }

        p {
          margin: 1rem 0;
        }

        code {
          font-size: 0.875rem;
        }

        .wrapper {
          display: flex;
          flex-direction: row;
          justify-content: center;
        }

        aside {
          width: 280px;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: scroll;
          display: none;
          border-right: 1px solid rgba(0, 128, 128, 0.25);
        }

        @media screen and (min-width: 960px) {
          .lso {
            display: none;
          }

          aside {
            display: block;
          }

          .wrapper {
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
          color: teal;
        }
      </style>
    </head>
    <body>
      <header>
        <a href="/">Synergy</a>
        <a href="/docs" class="lso">docs</a>
      </header>
      <div class="wrapper">
        <aside>${mainNavigation}</aside>
        <main>${mainContent}</main>
      </div>
    </body>
  </html>
`
