import puppeteer from "puppeteer-core"

export async function ssr(url) {
  const browser = await puppeteer.launch({ channel: "chrome", headless: true })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: "networkidle0" })
  const html = await page.content()
  await browser.close()
  return html
}
