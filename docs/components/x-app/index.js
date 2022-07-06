import hljs from "https://unpkg.com/@highlightjs/cdn-assets@11.5.1/es/highlight.min.js"

import { examples, myCounter } from "./examples.js"

function lengthOfLeadingSpace(str) {
  let space = str.split(/^(\s+)/)[1]
  return space?.length || 0
}

function trim(code) {
  const lines = code.split(/\n/)

  const lengthOfShortestSpace = lines
    .map(lengthOfLeadingSpace)
    .filter((v) => v > 0)
    .sort((a, b) => a - b)[0]

  return lines
    .map((line) => line.slice(lengthOfShortestSpace))
    .join("\n")
}

export default () => {
  return {
    state: {
      title: "Hello World!",
      myCounter,
    },
    // derive: {
    //   examples: ({ examples }) => {
    //     return examples.map((example) => ({
    //       ...example,
    //       items: example.items.map((item) => ({
    //         ...item,
    //         code: trim(item.code),
    //       })),
    //     }))
    //   },
    // },
    connectedCallback() {
      hljs.highlightAll()
    },
  }
}
