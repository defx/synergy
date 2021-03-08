export const isWhitespace = (node) =>
  node.nodeType === node.TEXT_NODE && node.nodeValue.match(/^\s+$/);

export const walk = (node, callback) => {
  if (callback(node) === false) return;

  node = node.firstChild;

  while (node) {
    if (!isWhitespace(node)) walk(node, callback);
    node = node.nextSibling;
  }
};

export const resolve = (path, ctx, target) => {
  let parts = path.split('.');
  let i = parts.length;
  while (i--) {
    if (parts[i].charAt(0) === '[') {
      let p = parts[i].slice(1, -1).replace(/:/g, '.');
      parts[i] = getValueAtPath(resolve(p, ctx), target);
    } else if (parts[i] === '*') {
      parts[i] = ctx[parts.slice(0, i).join('.')];
    }
  }

  return parts.join('.');
};

export const last = (v = []) => v[v.length - 1];

export const hasMustache = (v) => v.match(/({{[^{}]+}})/);

export const typeOf = (v) => Object.prototype.toString.call(v).match(/\s(.+[^\]])/)[1];

export const copy = (v) => v && JSON.parse(JSON.stringify(v));

const getTarget = (path, target) => {
  let parts = path.split('.');
  let t = parts.slice(0, -1).reduce((o, k) => o && o[k], target) || target;
  return [t, last(parts)];
};

export const getValueAtPath = (path, target) => {
  let [a, b] = getTarget(path, target);
  return a[b];
};

export const callFunctionAtPath = (path, target, args) => {
  let [a, b] = getTarget(path, target);
  return a[b].apply(a, args);
};

export const setValueAtPath = (path, value, target) => {
  let [a, b] = getTarget(path, target);
  return (a[b] = value);
};

export const removeNodes = (nodes) => nodes.forEach((node) => node.parentNode.removeChild(node));

export const templateNode = (v) => {
  if (v.nodeName === 'TEMPLATE') return v;
  let tpl = document.createElement('template');
  tpl.innerHTML = v;
  return tpl;
};

export const debounce = (fn) => {
  let t;
  return function () {
    if (t) return;
    t = requestAnimationFrame(() => {
      fn();
      t = null;
    });
  };
};

export const pascalToKebab = (string) =>
  string.replace(/[\w]([A-Z])/g, function (m) {
    return m[0] + '-' + m[1].toLowerCase();
  });

export const kebabToPascal = (string) =>
  string.replace(/[\w]-([\w])/g, function (m) {
    return m[0] + m[2].toUpperCase();
  });

export const attributeToProp = (k, v) => {
  let name = kebabToPascal(k);
  if (v === '') v = true;
  if (k.startsWith('aria-')) {
    if (v === 'true') v = true;
    if (v === 'false') v = false;
  }
  return {
    name,
    value: v,
  };
};

export const applyAttribute = (node, name, value) => {
  name = pascalToKebab(name);

  if (typeof value === 'boolean') {
    if (name.startsWith('aria-')) {
      value = '' + value;
    } else if (value) {
      value = '';
    }
  }

  if (typeof value === 'string' || typeof value === 'number') {
    node.setAttribute(name, value);
  } else {
    node.removeAttribute(name);
  }
};

export const isPrimitive = (v) => v === null || typeof v !== 'object';
