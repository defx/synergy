import { define } from "../synergy.js"
import { navigation } from "../data.js"

function flatten(items) {
  return items.reduce((acc, item) => {
    if (item.items) {
      acc.push(...item.items.map((v) => ({ ...v, category: item.title })))
    }
    return acc
  }, [])
}

define(
  "x-pager",
  () => {
    const items = flatten(navigation)
    const { pathname } = location
    const index = items.findIndex(({ href }) => href === pathname)

    return {
      state: {
        prev: items[index - 1],
        next: items[index + 1],
      },
    }
  },
  /* html */ `
  <a :if="next" :href="next.href">
    <span>NEXT</span>{{ next.title }}
    <svg width="10" height="16" viewBox="0 0 10 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polyline fill="none" vector-effect="non-scaling-stroke" points="2,2 8,8 2,14"></polyline>
    </svg>
  </a>
  <a :if="prev" :href="prev.href">
    <span>PREV</span>{{ prev.title }}
    <svg width="10" height="16" viewBox="0 0 10 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polyline fill="none" vector-effect="non-scaling-stroke" points="8,2 2,8 8,14"></polyline>
    </svg>
  </a>
    
`,
  /* css */ `
  x-pager {
    display: flex;
    flex-direction: column;
    padding: var(--s3) 0;
  }
  
  x-pager > * {
    flex: 1;
  }
  
   a {
    padding: var(--s3);
    border: 1px solid #eaeaea;
  }
  
   svg {
    stroke: currentColor;
    stroke-width: 1px;
    margin-right: 0 1rem;
    margin: auto 0;
  }
  
   a {
    margin-top: 0;
    text-decoration: none;
    vertical-align: center;
    font-size: var(--s2);
    color: #111;
  }
  
   a:hover {
    border: 1px solid rgb(102, 204, 51);
    color: rgb(102, 204, 51);
  }
  
   a span {
    color: #222;
    display: block;
    font-size: var(--s1);
  }
  
   a:nth-of-type(2) {
    text-align: right;
  }
  
   a:nth-of-type(1) {
    text-align: left;
  }
  
   a:nth-of-type(2) svg {
    float: left;
  }
  
   a:nth-of-type(1) svg {
    float: right;
  }
  
   a:nth-of-type(1) {
    margin-bottom: var(--s1);
  }
  
  @media screen and (min-width: 1024px) {
    x-pager {
      flex-direction: row-reverse;
    }
  
    a:nth-of-type(1) {
      margin-bottom: 0;
    }
  
    a:nth-of-type(2) {
      margin-right: 1rem;
    }
  }
`
)
