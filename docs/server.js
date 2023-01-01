import express from "express"
import fs from "fs-extra"
import hljs from "highlight.js"
import MarkdownIt from "markdown-it"
import { globby } from "globby"

import { listCustomElements } from "./customElements.js"
import { decapitate } from "./head.js"
import { navigation } from "./data/nav.js"
import { documentTemplate } from "./templates/document.js"
import { navTemplate } from "./templates/nav.js"

const componentsGlob = process.env.components || `components/**/*.js`

let md = new MarkdownIt({
  html: true,
  highlight: function (str, language) {
    if (language && hljs.getLanguage(language)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language, ignoreIllegals: true }).value +
          "</code></pre>"
        )
      } catch (__) {}
    }
    return (
      '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
    )
  },
})

;(async () => {
  const mainNavigation = navTemplate(navigation)
  const app = express()
  const port = 3000

  app.use(express.static("public"))

  app.use("/components", express.static("components"))

  app.get("/", (_, res) => {
    const html = documentTemplate({
      title: "Synergy | A JavaScript library for crafting Web Components",
      mainNavigation,
    })

    res.send(html)
  })

  app.use(async function (req, res, next) {
    if (req.originalUrl.includes(".")) return next()

    const route = req.originalUrl.split("?")[0]
    const fp = `./pages${route === "/" ? "/index" : route}.md`
    const markdown = await fs.readFile(fp, "utf8").catch((e) => {
      console.error(e)
      return null
    })

    if (markdown) {
      let { head, body } = decapitate(markdown)

      console.log({ head, body })

      const customElements = listCustomElements(body)

      let mainContent = md.render(body)

      if (customElements) {
        let paths = await globby([componentsGlob])

        paths = paths.filter((p) => {
          let [dir, file] = p.split("/").slice(-2)
          return customElements.find(
            (name) => dir === name || file.split(".")[0] === name
          )
        })

        if (paths.length) {
          // append scripts to body
          paths.forEach((path) => {
            mainContent += `<script type="module" src="/${path}"></script>`
          })
        }
      }

      const html = documentTemplate({
        headContent: head,
        mainContent,
        mainNavigation,
      })

      res.send(html)
    } else {
      next()
    }
  })

  app.listen(port, () => {
    console.log(`Synergy docs running on port ${port}`)
  })
})()
