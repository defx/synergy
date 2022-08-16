import fs from "fs-extra"
import path from "path"
import { flatNav } from "../public/data.js"
import { ssr } from "./ssr.js"

const OUT_DIR = "dist"

async function prerender() {
  await fs.ensureDir(OUT_DIR)

  await fs.copy("./components", OUT_DIR + "/components")
  await fs.copy("./public", OUT_DIR, { dereference: true })

  const promises = flatNav
    .map(({ href }) => ({
      url: path.join("http://localhost:8000", href),
      filename:
        OUT_DIR + "/" + (href === "/" ? "index.html" : `${href.slice(1)}.html`),
    }))
    .map(({ url, filename }) =>
      ssr(url).then((data) => fs.promises.writeFile(filename, data))
    )
  await Promise.all(promises).then(() => console.log("fini!"))
}

prerender()
