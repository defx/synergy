export function prefixSelectors(prefix, css) {
  let insideBlock = false
  let look = true
  let output = ""
  let count = 0

  for (let char of css) {
    if (char === "}") {
      insideBlock = false
      look = true
    } else if (char === ",") {
      look = true
    } else if (char === "{") {
      insideBlock = true
    } else if (look && !insideBlock && !char.match(/\s/)) {
      let w = nextWord(css, count + 1)
      if (
        w !== prefix &&
        w.charAt(0) !== "@" &&
        w.charAt(0) !== ":" &&
        w.charAt(0) !== "*" &&
        w !== "html" &&
        w !== "body"
      ) {
        output += prefix + " "
      }
      look = false
    }
    output += char
    count += 1
  }
}

export function appendStyles(name, css) {
  if (document.querySelector(`style#${name}`)) return

  const el = document.createElement("style")
  el.id = name
  el.innerHTML = prefixSelectors(name, css)
  document.head.appendChild(el)
}
