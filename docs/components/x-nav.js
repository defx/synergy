import { define } from "../synergy.js"
import { navigation } from "../data.js"

define(
  "x-nav",
  () => {
    return {
      state: { navigation },
    }
  },
  /* HTML */ `
    <nav>
      <ul>
        <li :each="navigation">
          <a :if="!items" :href>{{ title }}</a>
          <template :if="items">
            {{ title }}
            <ul>
              <li :each="items">
                <a :href>{{ title }}</a>
              </li>
            </ul>
          </template>
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
