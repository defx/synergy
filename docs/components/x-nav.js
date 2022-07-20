import { partial } from "../synergy.js"

partial(
  "x-nav",
  /* HTML */ `
    <nav>
      <ul>
        <li>
          Getting Started
          <ul>
            <li><a href="/">Introduction</a></li>
          </ul>
        </li>
        <li>
          Essentials
          <ul>
            <li><a href="/state">State</a></li>
            <li><a href="/template-syntax">Template syntax</a></li>
            <li><a href="/repeated-blocks">Repeated blocks</a></li>
            <li><a href="/events">Events</a></li>
            <li><a href="/styles">Styles</a></li>
            <li><a href="/forms">Forms</a></li>
            <li><a href="/slots">Slots</a></li>
            <li><a href="/api">API</a></li>
          </ul>
        </li>
        <li>
          Advanced Topics
          <ul>
            <li><a href="/best-practices">Best practices</a></li>
            <li><a href="/hydration">Hydration</a></li>
          </ul>
        </li>
      </ul>
    </nav>
  `,
  /* CSS */ `
  x-nav {
    padding: 1rem 2rem;
  }
  
  ul {
    margin-left: 1rem;
    list-style-type: none;
  }

  li {
    margin: 0.5rem 0;
  }
`
)
