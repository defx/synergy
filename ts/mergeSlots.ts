const childNodes = (node) => {
  let frag = document.createDocumentFragment();
  while (node.firstChild) {
    frag.appendChild(node.firstChild);
  }
  return frag;
};

function mergeSlots(targetNode, sourceNode) {
  let namedSlots = sourceNode.querySelectorAll('slot[name]');

  namedSlots.forEach((slot) => {
    let name = slot.attributes.name.value;
    let node = targetNode.querySelector(`[slot="${name}"]`);
    if (!node) {
      slot.parentNode.replaceChild(childNodes(slot), slot);
      return;
    }
    node.removeAttribute('slot');
    slot.parentNode.replaceChild(node, slot);
  });

  let defaultSlot = sourceNode.querySelector('slot:not([name])');

  if (defaultSlot) {
    defaultSlot.parentNode.replaceChild(
      childNodes(targetNode.innerHTML.trim() ? targetNode : defaultSlot),
      defaultSlot
    );
  }
}

export default mergeSlots;
