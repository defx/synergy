import { walk } from "./helpers.js"

const childNodes = (node) => {
  let frag = document.createDocumentFragment()
  while (node.firstChild) {
    frag.appendChild(node.firstChild)
  }
  return frag
}

/*

@bug: when using slots we're losing the node references cached in the bindings

in short, mergeSlots is grosely under-tested

yep, all slot tests only pass in plain html, never another component..

*/

export const mergeSlots = (targetNode, sourceNode) => {
  let namedSlots = sourceNode.querySelectorAll("slot[name]")

  namedSlots.forEach((slot) => {
    let name = slot.attributes.name.value
    let node = targetNode.querySelector(`[slot="${name}"]`)
    if (!node) {
      slot.parentNode.replaceChild(childNodes(slot), slot)
      return
    }
    node.removeAttribute("slot")
    slot.parentNode.replaceChild(node, slot)
  })

  let defaultSlot = sourceNode.querySelector("slot:not([name])")

  if (defaultSlot) {
    let t = targetNode.innerHTML.trim() ? targetNode : defaultSlot

    walk(t, (node) => {
      if (!node.$i) return
      console.log("@todo: update ref", node, node.$i)
    })

    while (t.firstChild) {
      defaultSlot.parentNode.insertBefore(t.firstChild, defaultSlot)
    }

    /*
    
    proving that it still exists at this point...
    
    */

    // walk(defaultSlot.parentNode, (node) => {
    //   if (node.$i === 28) console.log("gotcha!")
    // })

    defaultSlot.remove()
  }
}
