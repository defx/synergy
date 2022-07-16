import hljs from "https://unpkg.com/@highlightjs/cdn-assets@11.5.1/es/highlight.min.js"

import { myCounter } from "./examples.js"

export default () => {
  return {
    state: {
      title: "Hello World!",
      myCounter,
    },
    connectedCallback() {
      hljs.highlightAll()
    },
  }
}
