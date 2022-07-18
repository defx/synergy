import { partial } from "../synergy.js"

partial(
  "x-hero",
  /* HTML */ `
    <section>
      <h1>The JavaScript UI Framework</h1>
      <ul>
        <li><strong>declarative</strong> data &amp; event binding</li>
        <li><strong>functional</strong> state management</li>
        <li><strong>reactive</strong> updates</li>
      </ul>
    </section>
  `,
  /* CSS */ `
  x-hero {
    padding: 2rem;
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
  `
)
