export const updateFormControl = (node, value) => {
  if (node.nodeName === "SELECT") {
    Array.from(node.querySelectorAll("option")).forEach((option) => {
      option.selected = value.includes(option.value)
    })
    return
  }

  let checked

  switch (node.getAttribute("type")) {
    case "checkbox":
      checked = value
      if (node.checked === checked) break
      if (checked) {
        node.setAttribute("checked", "")
      } else {
        node.removeAttribute("checked")
      }
      break
    case "radio":
      checked = value === node.getAttribute("value")
      if (node.checked === checked) break
      node.checked = checked
      if (checked) {
        node.setAttribute("checked", "")
      } else {
        node.removeAttribute("checked")
      }
      break
    default:
      if (node.value !== value) {
        if (!isNaN(value) && node.value.slice(-1) === ".") break
        node.setAttribute("value", (node.value = value ?? ""))
      }

      break
  }
}
