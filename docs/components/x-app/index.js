import hljs from "https://unpkg.com/@highlightjs/cdn-assets@11.5.1/es/highlight.min.js"

import { examples } from "./examples.js"

export default () => {
  return {
    initialState: {
      title: "Hello World!",
      examples,
    },
    connectedCallback() {
      hljs.highlightAll()
    },
  }
}
