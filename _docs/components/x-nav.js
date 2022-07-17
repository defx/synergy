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
            <li><a href="/template-syntax">Template syntax</a></li>
            <li><a href="/events">Events</a></li>
            <li><a href="/state">State</a></li>
            <li><a href="/styles">Styles</a></li>
            <li><a href="/conditional-rendering">Conditional rendering</a></li>
            <li><a href="/lists">Lists</a></li>
            <li><a href="/forms">Forms</a></li>
            <li>
              CLI
              <ul>
                <li><a href="">Config</a></li>
                <li><a href="">Partials</a></li>
                <li><a href="">Scoped CSS</a></li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          Advanced Usage
          <ul>
            <li><a href="">Custom Elements</a></li>
            <li><a href="">Slots</a></li>
            <li><a href="">Lazy loading</a></li>
            <li><a href="">Hydration</a></li>
          </ul>
        </li>
      </ul>
    </nav>
  `,
  /* CSS */ `
  x-nav {
    padding: 1rem 0;
  }
  
  ul {
    margin-left: 1rem;
    list-style-type: none;
  }
`
)
