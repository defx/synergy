import hljs from "https://unpkg.com/@highlightjs/cdn-assets@11.5.1/es/highlight.min.js"

import { examples } from "./examples.js"

const OPEN = /\/\*\s*#h\s*\*\//gm
const CLOSE = /\/\*\s*\/h\s*\*\//gm

function lengthOfLeadingSpace(str) {
  let space = str.split(/^(\s+)/)[1]
  return space?.length || 0
}

function trim(code) {
  const lines = code.split(/\n/)

  const lengthOfShortestLine = lines
    .map(lengthOfLeadingSpace)
    .filter((v) => v > 0)
    .sort((a, b) => a - b)[0]

  return lines
    .map((line) => line.slice(lengthOfShortestLine))
    .join("\n")
}

export const isWhitespace = (node) => {
  return (
    node.nodeType === node.TEXT_NODE &&
    node.nodeValue.trim() === ""
  )
}

const walk = (node, callback, deep = true) => {
  if (!node) return
  if (!isWhitespace(node)) {
    let v = callback(node)
    if (v?.nodeName) return walk(v, callback, deep)
  }
  if (deep) walk(node.firstChild, callback, deep)
  walk(node.nextSibling, callback, deep)
}

export default () => {
  return {
    initialState: {
      title: "Hello World!",
      examples,
    },
    derive: {
      examples: ({ examples }) => {
        return examples.map((example) => ({
          ...example,
          items: example.items.map((item) => ({
            ...item,
            code: trim(item.code),
          })),
        }))
      },
    },
    connectedCallback() {
      hljs.highlightAll()

      const code = document.querySelector("pre code")

      if (code.innerHTML.match(OPEN)) {
        code.setAttribute("has-highlights", "")

        code.innerHTML = code.innerHTML
          .replace(OPEN, "<em>")
          .replace(CLOSE, "</em>")
      }

      walk(code, (node) => {
        if (node.nodeType === node.TEXT_NODE) {
          if (node.textContent.trim()) {
            if (
              !node.parentNode.closest(`[class^="hljs-"]`)
            ) {
              const span = document.createElement("span")
              span.setAttribute("x-o", "")
              node.after(span)
              span.appendChild(node)
              return span.nextSibling
            }
          }
        }
      })
    },
  }
}
