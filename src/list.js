import { isWhitespace, walk } from "./helpers.js";

export function parseEach(node) {
  let each = node.getAttribute("each");
  let m = each?.match(/(.+)\s+in\s+(.+)/);
  if (!m) {
    if (!each) return m;
    return {
      path: each.trim(),
      key: node.getAttribute("key"),
    };
  }
  let [_, left, right] = m;
  let parts = left.match(/\(([^\)]+)\)/);
  let [a, b] = (parts ? parts[1].split(",") : [left]).map((v) => v.trim());

  return {
    path: right.trim(),
    identifier: b ? b : a,
    index: b ? a : b,
    key: node.getAttribute("key"),
  };
}

const getBlockSize = (template) => {
  let i = 0;
  walk(template.content?.firstChild || template.firstChild, () => i++, false);
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

export const compareKeyedLists = (key, a = [], b = []) => {
  let delta = b.map(([k, item]) =>
    !key ? (k in a ? k : -1) : a.findIndex(([_, v]) => v[key] === item[key])
  );
  if (a.length !== b.length || !delta.every((a, b) => a === b)) return delta;
};

export const updateList = (template, delta, entries, createListItem) => {
  let n = template.getAttribute("length") || 0;
  let blocks = getBlockFragments(template, n);
  let t = template;

  delta.forEach((i, newIndex) => {
    let frag =
      i === -1
        ? createListItem(entries[newIndex][1], entries[newIndex][0])
        : blocks[i];
    let x = frag.lastChild || frag;
    t.after(frag);
    t = x;
  });

  template.setAttribute("length", delta.length);
};
