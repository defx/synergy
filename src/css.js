function nextWord(css, count) {
  return css.slice(count - 1).split(/[\s+|\n+|,]/)[0]
}

function nextOpenBrace(css, count) {
  let index = css.slice(count - 1).indexOf("{")
  if (index > -1) {
    return count + index
  }
}

export function prefixSelectors(prefix, css) {
  let insideBlock = false
  let look = true
  let output = ""
  let count = 0
  let skip = false

  for (let char of css) {
    if (char === "@" && nextWord(css, count + 1) === "@media") {
      skip = nextOpenBrace(css, count)
    }

    if (skip) {
      if (skip === count) skip = false
    }

    if (!skip) {
      if (char === "}") {
        insideBlock = false
        look = true
      } else if (char === ",") {
        look = true
      } else if (char === "{") {
        insideBlock = true
      } else if (look && !insideBlock && !char.match(/\s/)) {
        let w = nextWord(css, count + 1)

        // console.log({ w })

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
    }
    output += char
    count += 1
  }

  return output
}

export function appendStyles(name, css) {
  if (document.querySelector(`style#${name}`)) return

  const el = document.createElement("style")
  el.id = name
  el.innerHTML = prefixSelectors(name, css)
  document.head.appendChild(el)
}
