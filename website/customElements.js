const ANON = /<([a-z]\w*-\w*)/gm

function unique(arr) {
  return [...new Set(arr)]
}

export function listCustomElements(html = "") {
  const names = (html.match(ANON) || []).map((v) => v.slice(1))
  return unique(names)
}
