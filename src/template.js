export const convertToTemplate = (node) => {
  let ns = node.namespaceURI

  if (ns.endsWith("/svg")) {
    let tpl = document.createElementNS(ns, "defs")
    tpl.innerHTML = node.outerHTML
    node.parentNode.replaceChild(tpl, node)
    return tpl
  } else {
    if (node.nodeName === "TEMPLATE") return node

    let tpl = document.createElement("template")

    tpl.innerHTML = node.outerHTML
    node.parentNode.replaceChild(tpl, node)

    return tpl
  }
}
