import { RepeatedBlock } from './types';

export const isWhitespace = (node: Node) =>
  node.nodeType === node.TEXT_NODE &&
  node.nodeValue!.match(/^\s+$/);

export function walk(node: Node, callback: Function) {
  if (callback(node) === false) return;

  let el = node.firstChild;

  while (el) {
    if (!isWhitespace(el)) walk(el, callback);
    el = node.nextSibling;
  }
}

export const last = (v: any[]) => v[v.length - 1];

export const resolve = (
  path: string,
  context: RepeatedBlock[]
) => {
  let i = context.length;
  while (i--) {
    let { valueIdentifier, prop } = context[i];

    path = path
      .split('.')
      .map((v: string) => {
        if (v === valueIdentifier) return `${prop}.*`;

        return v;
      })
      .join('.');
  }
  return path;
};

export const hasMustache = (v: string) =>
  v.match(/({{[^{}]+}})/);

export const getParts = (
  value: string,
  context: RepeatedBlock[]
) =>
  value
    .trim()
    .split(/({{[^{}]+}})/)
    .filter((v) => v)
    .map((v) => {
      let match = v.match(/{{([^{}]+)}}/);

      if (match) {
        let [, a = '', b] = match[1]
          .trim()
          .match(/(!)?(.+)/)!;

        return {
          type: 'key',
          value: a + resolve(b, context),
        };
      }

      return {
        type: 'value',
        value: v,
      };
    });

export const typeOf = (v: any) =>
  Object.prototype.toString
    .call(v)
    .match(/\s(.+[^\]])/)![1];

export const copy = (v: any) =>
  v && JSON.parse(JSON.stringify(v));

export const getValueAtPath = (
  path: string,
  target: Record<string, any>
) => path.split('.').reduce((o, k) => o && o[k], target);

export const setValueAtPath = (
  path: string,
  value: any,
  target: Record<string, any>
) => {
  let parts = path.split('.');
  if (parts.length === 1) return (target[path] = value);
  target = getValueAtPath(
    parts.slice(0, -1).join('.'),
    target
  );
  target[last(parts)] = value;
};

export const removeNodes = (nodes: Element[]) =>
  nodes.forEach((node) => node.remove());

export function templateNode(
  v: HTMLTemplateElement | string
) {
  if (v instanceof HTMLTemplateElement) return v;
  let tpl = document.createElement('template');
  tpl.innerHTML = v;
  return tpl;
}

export const debounce = (fn: Function) => {
  let t: number;
  return function () {
    if (t) return;
    t = requestAnimationFrame(() => {
      fn();
      t = 0;
    });
  };
};

export const pascalToKebab = (string: string) =>
  string.replace(/[\w]([A-Z])/g, function (m) {
    return m[0] + '-' + m[1].toLowerCase();
  });

export const kebabToPascal = (string: string) =>
  string.replace(/[\w]-([\w])/g, function (m) {
    return m[0] + m[2].toUpperCase();
  });

export const attributeToProp = (
  k: string,
  v: string | boolean
) => {
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

export function applyAttribute(
  node: Element,
  name: string,
  value: boolean | string | number | null | undefined
) {
  name = pascalToKebab(name);

  if (typeof value === 'boolean') {
    if (name.startsWith('aria-')) {
      value = '' + value;
    } else if (value) {
      value = '';
    }
  }

  if (typeof value === 'number') value = '' + value;

  if (typeof value === 'string') {
    node.setAttribute(name, value);
  } else {
    node.removeAttribute(name);
  }
}

export const isPrimitive = (v: any) =>
  v === null || typeof v !== 'object';
