import { isWhitespace, walk } from "./helpers.js";

export function parseEach(node) {
  let each = node.getAttribute("each");
  let m = each && each.match(/(.+)\s+in\s+(.+)/);
  if (!m) return;
  let [_, left, right] = m;
  let parts = left.match(/\(([^\)]+)\)/);
  let [identifier, index] = (parts ? parts[1].split(",") : [left]).map((v) =>
    v.trim()
  );

  return {
    path: right.trim(),
    identifier,
    index,
    key: node.getAttribute("key"),
  };
}

export const compareKeyedLists = (key, a = [], b = []) => {
  let delta = b.map((item, i) =>
    !key ? (i in a ? i : -1) : a.findIndex((v) => v[key] === item[key])
  );
  if (a.length !== b.length || !delta.every((a, b) => a === b)) return delta;
};

const getBlockSize = (template) => {
  let i = 0;
  walk(template.content.firstChild, () => i++, false);
  return i;
};

const nextNonWhitespaceSibling = (node) => {
  return isWhitespace(node.nextSibling)
    ? nextNonWhitespaceSibling(node.nextSibling)
    : node.nextSibling;
};

const getBlockFragments = (template, numBlocks) => {
  let blockSize = getBlockSize(template);

  let r = [];
  if (numBlocks) {
    while (numBlocks--) {
      let f = document.createDocumentFragment();
      let n = blockSize;
      while (n--) {
        f.appendChild(nextNonWhitespaceSibling(template));
      }
      r.push(f);
    }
  }
  return r;
};

export const getBlocks = (template, numBlocks) => {
  let blockSize = getBlockSize(template);
  let r = [];
  let node = template;
  if (numBlocks) {
    while (numBlocks--) {
      let f = [];
      let n = blockSize;
      while (n--) {
        node = nextNonWhitespaceSibling(node);
        f.push(node);
      }
      r.push(f);
    }
  }
  return r;
};

export const updateList = (template, delta, arr, createListItem) => {
  let n = template.getAttribute("length") || 0;
  let blocks = getBlockFragments(template, n);
  let t = template;

  delta.forEach((i, newIndex) => {
    let frag = i === -1 ? createListItem(arr[newIndex], newIndex) : blocks[i];
    let x = frag.lastChild;
    t.after(frag);
    t = x;
  });

  template.setAttribute("length", delta.length);
};
