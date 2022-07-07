const wrapToken = (v) => {
  v = v.trim();
  if (v.startsWith("{{")) return v
  return `{{${v}}}`
};

const last = (v = []) => v[v.length - 1];

const isWhitespace = (node) => {
  return node.nodeType === node.TEXT_NODE && node.nodeValue.trim() === ""
};

const walk = (node, callback, deep = true) => {
  if (!node) return
  if (!isWhitespace(node)) {
    let v = callback(node);
    if (v === false) return
    if (v?.nodeName) return walk(v, callback, deep)
  }
  if (deep) walk(node.firstChild, callback, deep);
  walk(node.nextSibling, callback, deep);
};

const transformBrackets = (str = "") => {
  let parts = str.split(/(\[[^\]]+\])/).filter((v) => v);
  return parts.reduce((a, part) => {
    let v = part.charAt(0) === "[" ? "." + part.replace(/\./g, ":") : part;
    return a + v
  }, "")
};

const getTarget = (path, target) => {
  let parts = transformBrackets(path)
    .split(".")
    .map((k) => {
      if (k.charAt(0) === "[") {
        let p = k.slice(1, -1).replace(/:/g, ".");
        return getValueAtPath(p, target)
      } else {
        return k
      }
    });

  let t =
    parts.slice(0, -1).reduce((o, k) => {
      return o && o[k]
    }, target) || target;
  return [t, last(parts)]
};

const getValueAtPath = (path, target) => {
  let [a, b] = getTarget(path, target);
  let v = a?.[b];
  if (typeof v === "function") return v.bind(a)
  return v
};

const setValueAtPath = (path, value, target) => {
  let [a, b] = getTarget(path, target);
  return (a[b] = value)
};

const fragmentFromTemplate = (v) => {
  if (typeof v === "string") {
    if (v.charAt(0) === "#") {
      v = document.getElementById(v);
    } else {
      let tpl = document.createElement("template");
      tpl.innerHTML = v.trim();
      return tpl.content
    }
  }
  if (v.nodeName === "TEMPLATE") return v.cloneNode(true).content
  if (v.nodeName === "defs") return v.firstElementChild.cloneNode(true)
};

const debounce = (fn) => {
  let wait = false;
  let invoke = false;
  return () => {
    if (wait) {
      invoke = true;
    } else {
      wait = true;
      fn();
      requestAnimationFrame(() => {
        if (invoke) fn();
        wait = false;
      });
    }
  }
};

const isPrimitive = (v) => v === null || typeof v !== "object";

const typeOf = (v) =>
  Object.prototype.toString.call(v).match(/\s(.+[^\]])/)[1];

const pascalToKebab = (string) =>
  string.replace(/[\w]([A-Z])/g, function (m) {
    return m[0] + "-" + m[1].toLowerCase()
  });

const kebabToPascal = (string) =>
  string.replace(/[\w]-([\w])/g, function (m) {
    return m[0] + m[2].toUpperCase()
  });

const applyAttribute = (node, name, value) => {
  name = pascalToKebab(name);

  if (typeof value === "boolean") {
    if (name.startsWith("aria-")) {
      value = "" + value;
    } else if (value) {
      value = "";
    }
  }

  if (typeof value === "string" || typeof value === "number") {
    node.setAttribute(name, value);
  } else {
    node.removeAttribute(name);
  }
};

const attributeToProp = (k, v) => {
  let name = kebabToPascal(k);
  if (v === "") v = true;
  if (k.startsWith("aria-")) {
    if (v === "true") v = true;
    if (v === "false") v = false;
  }
  return {
    name,
    value: v,
  }
};

function getDataScript(node) {
  return node.querySelector(`script[type="application/synergy"]`)
}

function systemReducer(state, action) {
  switch (action.type) {
    case "SET": {
      const { name, value } = action.payload;

      let o = { ...state };
      setValueAtPath(name, value, o);

      return o
    }
    case "MERGE": {
      return {
        ...state,
        ...action.payload,
      }
    }
  }
}

function unique(arr) {
  return [...new Set(arr)]
}

function configure(
  { update = {}, middleware = [], derive = {}, state: initialState = {} },
  node
) {
  let subscribers = [];
  let state;
  let updatedCallback = () => {};

  let dollarKeys = unique(
    Object.keys(update)
      .concat(Object.keys(middleware))
      .filter((v) => v.startsWith("$"))
  );

  function updateState(o) {
    state = { ...o };
    for (let k in derive) {
      state[k] = derive[k](o);
    }
  }

  updateState(initialState);

  function getState() {
    return { ...state }
  }

  function subscribe(fn) {
    subscribers.push(fn);
  }

  function flush() {
    subscribers.forEach((fn) => fn());
    subscribers = [];
  }

  function onUpdate(fn) {
    updatedCallback = fn;
  }

  function dispatch(action) {
    const { type } = action;

    if (type.startsWith("$")) {
      node.parentNode.dispatchEvent(
        new CustomEvent(type, {
          detail: action,
          bubbles: true,
        })
      );
    }

    if (type === "SET" || type === "MERGE") {
      updateState(systemReducer(getState(), action));
    } else {
      let next = (middleware) => (action) => {
        let mw = middleware[action.type];

        if (mw) {
          if (typeof mw === "function") {
            mw(
              action,
              next({
                ...middleware,
                [action.type]: null,
              }),
              {
                getState,
                dispatch,
                afterNextRender: subscribe,
              }
            );
            return
          }
          if (Array.isArray(mw) && mw.length) {
            let fn = mw[0];
            fn(
              action,
              next({
                ...middleware,
                [action.type]: mw.slice(1),
              }),
              {
                getState,
                dispatch,
                afterNextRender: subscribe,
              }
            );
            return
          }
        }

        if (action.type in update) {
          updateState(update[action.type](getState(), action));
          updatedCallback();
        }
      };

      next(middleware)(action);
    }

    updatedCallback();
  }

  for (let actionName of dollarKeys) {
    node.addEventListener(actionName, ({ detail }) => {
      dispatch(detail);
    });
  }

  return {
    dispatch,
    getState,
    onUpdate,
    flush,
  }
}

const TEXT = 1;
const ATTRIBUTE = 2;
const INPUT = 3;
const EVENT = 4;
const REPEAT = 5;
const CONDITIONAL = 6;

const updateFormControl = (node, value) => {
  if (node.nodeName === "SELECT") {
    Array.from(node.querySelectorAll("option")).forEach((option) => {
      option.selected = value.includes(option.value);
    });
    return
  }

  let checked;

  switch (node.getAttribute("type")) {
    case "checkbox":
      checked = value;
      if (node.checked === checked) break
      if (checked) {
        node.setAttribute("checked", "");
      } else {
        node.removeAttribute("checked");
      }
      break
    case "radio":
      checked = value === node.getAttribute("value");
      if (node.checked === checked) break
      node.checked = checked;
      if (checked) {
        node.setAttribute("checked", "");
      } else {
        node.removeAttribute("checked");
      }
      break
    default:
      if (node.value !== value)
        node.setAttribute("value", (node.value = value ?? ""));
      break
  }
};

function parseEach(node) {
  let each = node.getAttribute(":each");
  let m = each?.match(/(.+)\s+in\s+(.+)/);
  if (!m) {
    if (!each) return m
    return {
      path: each.trim(),
      key: node.getAttribute("key"),
    }
  }
  let [_, left, right] = m;
  let parts = left.match(/\(([^\)]+)\)/);
  let [a, b] = (parts ? parts[1].split(",") : [left]).map((v) => v.trim());

  return {
    path: right.trim(),
    identifier: b ? b : a,
    index: b ? a : b,
    key: node.getAttribute("key"),
  }
}

const getBlockSize = (template) => {
  let i = 0;
  walk(template.content?.firstChild || template.firstChild, () => i++, false);
  return i
};

const nextNonWhitespaceSibling = (node) => {
  return isWhitespace(node.nextSibling)
    ? nextNonWhitespaceSibling(node.nextSibling)
    : node.nextSibling
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
  return r
};

const getBlocks = (template) => {
  let numBlocks = template.getAttribute("length");
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
  return r
};

const compareKeyedLists = (key, a = [], b = []) => {
  let delta = b.map(([k, item]) =>
    !key ? (k in a ? k : -1) : a.findIndex(([_, v]) => v[key] === item[key])
  );
  if (a.length !== b.length || !delta.every((a, b) => a === b)) return delta
};

function lastChild(v) {
  return (v.nodeType === v.DOCUMENT_FRAGMENT_NODE && v.lastChild) || v
}

const updateList = (template, delta, entries, createListItem) => {
  let n = +(template.getAttribute("length") || 0);

  const unchanged = delta.length === n && delta.every((a, b) => a == b);

  if (unchanged) return

  let blocks = getBlockFragments(template, n);
  let t = template;

  delta.forEach((i, newIndex) => {
    let frag =
      i === -1
        ? createListItem(entries[newIndex][1], entries[newIndex][0])
        : blocks[i];
    let x = lastChild(frag);
    t.after(frag);
    t = x;
  });

  template.setAttribute("length", delta.length);
};

const VALUE = 1;
const KEY = 2;
const FUNCTION = 3;

const hasMustache = (v) => v.match(/({{[^{}]+}})/);

const getParts = (value) =>
  value
    .trim()
    .split(/({{[^{}]+}})/)
    .filter((v) => v)
    .map((value) => {
      let match = value.match(/{{([^{}]+)}}/);

      if (!match)
        return {
          type: VALUE,
          value,
          negated: false,
        }

      value = match[1].trim();
      let negated = value.charAt(0) === "!";
      if (negated) value = value.slice(1);

      return {
        type: KEY,
        value,
        negated,
      }
    });

const getValueFromParts = (target, parts) => {
  return parts.reduce((a, part) => {
    let { type, value, negated } = part;

    let v;

    if (type === VALUE) v = value;
    if (type === KEY) {
      v = getValueAtPath(value, target);
    }
    if (type === FUNCTION) {
      let args = part.args.map((value) => getValueAtPath(value, target));

      v = getValueAtPath(part.method, target)?.(...args);
    }

    if (negated) v = !v;

    return a || a === 0 ? a + v : v
  }, "")
};

const pascalToKebab$1 = (string) =>
  string.replace(/[\w]([A-Z])/g, function (m) {
    return m[0] + "-" + m[1].toLowerCase()
  });

const kebabToPascal$1 = (string) =>
  string.replace(/[\w]-([\w])/g, function (m) {
    return m[0] + m[2].toUpperCase()
  });

const parseStyles = (value) => {
  let type = typeof value;

  if (type === "string")
    return value.split(";").reduce((o, value) => {
      const [k, v] = value.split(":").map((v) => v.trim());
      if (k) o[k] = v;
      return o
    }, {})

  if (type === "object") return value

  return {}
};

const joinStyles = (value) =>
  Object.entries(value)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ");

const convertStyles = (o) =>
  Object.keys(o).reduce((a, k) => {
    a[pascalToKebab$1(k)] = o[k];
    return a
  }, {});

const applyAttribute$1 = (node, name, value) => {
  if (name === "style") {
    value = joinStyles(
      convertStyles({
        ...parseStyles(node.getAttribute("style")),
        ...parseStyles(value),
      })
    );
  } else if (name === "class") {
    switch (typeOf(value)) {
      case "Array":
        value = value.join(" ");
        break
      case "Object":
        value = Object.keys(value)
          .reduce((a, k) => {
            if (value[k]) a.push(k);
            return a
          }, [])
          .join(" ");
        break
    }
  } else if (!isPrimitive(value)) {
    return (node[kebabToPascal$1(name)] = value)
  }

  name = pascalToKebab$1(name);

  if (typeof value === "boolean") {
    if (name.startsWith("aria-")) {
      value = "" + value;
    } else if (value) {
      value = "";
    }
  }

  let current = node.getAttribute(name);

  if (value === current) return

  if (typeof value === "string" || typeof value === "number") {
    node.setAttribute(name, value);
  } else {
    node.removeAttribute(name);
  }
};

const handler = ({ path, identifier, key, index, i, k }) => ({
  get(target, property) {
    let x = getValueAtPath(path, target);

    // x === the collection

    if (property === identifier) {
      for (let n in x) {
        let v = x[n];
        if (key) {
          if (v[key] === k) return v
        } else {
          if (n == i) return v
        }
      }
    }

    if (property === index) {
      for (let n in x) {
        let v = x[n];
        if (key) {
          if (v[key] === k) return n
        } else {
          if (n == i) return n
        }
      }
    }

    let t = key ? x.find((v) => v[key] === k) : x?.[i];
    if (t?.hasOwnProperty?.(property)) return t[property]

    return Reflect.get(...arguments)
  },
  set(target, property, value) {
    let x = getValueAtPath(path, target);
    let t = key ? x.find((v) => v[key] === k) : x[i];
    if (t && !isPrimitive(t)) {
      t[property] = value;
      return true
    }

    return Reflect.set(...arguments)
  },
});

const createContext = (v = []) => {
  let context = v;
  return {
    get: () => context,
    push: (v) => context.push(v),
    wrap: (state) => {
      return context.reduce(
        (target, ctx) => new Proxy(target, handler(ctx)),
        state
      )
    },
  }
};

const convertToTemplate = (node) => {
  let ns = node.namespaceURI;

  if (ns.endsWith("/svg")) {
    let tpl = document.createElementNS(ns, "defs");
    tpl.innerHTML = node.outerHTML;
    node.parentNode.replaceChild(tpl, node);
    return tpl
  } else {
    if (node.nodeName === "TEMPLATE") return node

    let tpl = document.createElement("template");

    tpl.innerHTML = node.outerHTML;
    node.parentNode.replaceChild(tpl, node);

    return tpl
  }
};

const render = (
  target,
  { getState, dispatch },
  template,
  updatedCallback,
  beforeMountCallback
) => {
  let observer = () => {
    let subscribers = new Set();
    return {
      publish: (cb) => {
        for (let fn of subscribers) {
          fn();
        }
        cb?.();
      },
      subscribe(fn) {
        subscribers.add(fn);
      },
    }
  };

  const createSubscription = {
    [TEXT]: ({ value, node, context }, { getState }) => {
      return {
        handler: () => {
          let state = context ? context.wrap(getState()) : getState();
          let a = node.textContent;
          let b = getValueFromParts(state, getParts(value));
          if (a !== b) node.textContent = b;
        },
      }
    },
    [ATTRIBUTE]: ({ value, node, name, context }, { getState }) => {
      return {
        handler: () => {
          let state = context ? context.wrap(getState()) : getState();
          let b = getValueFromParts(state, getParts(value));

          applyAttribute$1(node, name, b);

          if (node.nodeName === "OPTION") {
            let path = node.parentNode.getAttribute("name");
            let selected = getValueAtPath(path, state);
            node.selected = selected === b;
          }
        },
      }
    },
    [INPUT]: ({ node, path, context }, { getState, dispatch }) => {
      let eventType = ["radio", "checkbox"].includes(node.type)
        ? "click"
        : "input";

      node.addEventListener(eventType, () => {
        let value =
          node.getAttribute("type") === "checkbox" ? node.checked : node.value;

        if (value.trim?.().length && !isNaN(value)) value = +value;

        if (context) {
          let state = context.wrap(getState());
          setValueAtPath(path, value, state);
          dispatch({
            type: "MERGE",
            payload: state,
          });
        } else {
          dispatch({
            type: "SET",
            payload: {
              name: path,
              value,
              context,
            },
          });
        }
      });

      return {
        handler: () => {
          let state = context ? context.wrap(getState()) : getState();
          updateFormControl(node, getValueAtPath(path, state));
        },
      }
    },
    [EVENT]: (
      { node, eventType, actionType, context },
      { dispatch, getState }
    ) => {
      node.addEventListener(eventType, (event) => {
        let action = {
          type: actionType,
          event,
          context: context ? context.wrap(getState()) : getState(),
        };

        dispatch(action);
      });
      return {
        handler: () => {},
      }
    },
    [CONDITIONAL]: ({ node, expression, context, map }, { getState }) => {
      return {
        handler: () => {
          let state = context ? context.wrap(getState()) : getState();
          let shouldMount = getValueFromParts(
            state,
            getParts(wrapToken(expression))
          );
          let isMounted = node.getAttribute("m") === "1";

          if (shouldMount && !isMounted) {
            // MOUNT
            let frag = fragmentFromTemplate(node);
            walk(frag.firstChild, bindAll(map, null, context));
            node.after(frag);
            node.setAttribute("m", "1");
          } else if (!shouldMount && isMounted) {
            // UNMOUNT
            node.nextSibling.remove();
            node.removeAttribute("m");
          }
        },
        // pickupNode,
      }
    },
    [REPEAT]: (
      { node, context, map, path, identifier, index, key, blockIndex, hydrate },
      { getState }
    ) => {
      let oldValue;
      node.$t = blockIndex - 1;

      let pickupNode = node.nextSibling;

      const initialiseBlock = (rootNode, i, k, exitNode) => {
        walk(
          rootNode,
          multi(
            (node) => {
              if (node === exitNode) return false
            },
            bindAll(
              map,
              hydrate,
              createContext(
                (context?.get() || []).concat({
                  path,
                  identifier,
                  key,
                  index,
                  i,
                  k,
                })
              )
            ),
            (child) => (child.$t = blockIndex)
          )
        );
      };

      function firstChild(v) {
        return (v.nodeType === v.DOCUMENT_FRAGMENT_NODE && v.firstChild) || v
      }

      const createListItem = (datum, i) => {
        let k = datum[key];
        let frag = fragmentFromTemplate(node);

        initialiseBlock(firstChild(frag), i, k);
        return frag
      };

      if (hydrate) {
        let x = getValueAtPath(path, getState());
        let blocks = getBlocks(node);

        blocks.forEach((block, i) => {
          let datum = x[i];
          let k = datum?.[key];
          initialiseBlock(block[0], i, k, last(block).nextSibling);
        });

        pickupNode = last(last(blocks)).nextSibling;
      }

      return {
        handler: () => {
          let state = context ? context.wrap(getState()) : getState();

          const newValue = Object.entries(getValueAtPath(path, state) || []);
          const delta = compareKeyedLists(key, oldValue, newValue);

          if (delta) {
            updateList(node, delta, newValue, createListItem);
          }
          oldValue = newValue.slice(0);
        },
        pickupNode,
      }
    },
  };

  const mediator = () => {
    const o = observer();
    return {
      bind(v) {
        let s = createSubscription[v.type](v, { getState, dispatch });
        o.subscribe(s.handler);
        return s
      },

      update(cb) {
        return o.publish(cb)
      },
    }
  };

  const { bind, update } = mediator();

  let blockCount = 0;

  const parse = (frag) => {
    let index = 0;
    let map = {};

    walk(frag, (node) => {
      let x = [];
      let pickupNode;

      switch (node.nodeType) {
        case node.TEXT_NODE: {
          let value = node.textContent;
          if (hasMustache(value)) {
            x.push({
              type: TEXT,
              value,
            });
          }
          break
        }
        case node.ELEMENT_NODE: {
          let each = parseEach(node);

          if (each) {
            let ns = node.namespaceURI;
            let m;

            node.removeAttribute(":each");
            node = convertToTemplate(node);

            if (ns.endsWith("/svg")) {
              m = parse(node.firstChild);
            } else {
              m = parse(node.content.firstChild);
            }

            pickupNode = node.nextSibling;

            x.push({
              type: REPEAT,
              map: m,
              blockIndex: blockCount++,
              ...each,
            });

            break
          }

          let attrs = node.attributes;
          let i = attrs.length;
          while (i--) {
            let { name, value } = attrs[i];

            if (
              name === ":name" &&
              value &&
              (node.nodeName === "INPUT" ||
                node.nodeName === "SELECT" ||
                node.nodeName === "TEXTAREA")
            ) {
              x.push({
                type: INPUT,
                path: value,
              });

              node.removeAttribute(name);
              node.setAttribute("name", value);
            } else if (name === ":if") {
              node.removeAttribute(name);
              node = convertToTemplate(node);
              pickupNode = node.nextSibling;

              x.push({
                type: CONDITIONAL,
                expression: value,
                map: parse(node.content?.firstChild || node.firstChild),
              });
            } else if (name.startsWith(":on")) {
              node.removeAttribute(name);
              let eventType = name.split(":on")[1];
              x.push({
                type: EVENT,
                eventType,
                actionType: value,
              });
            } else if (name.startsWith(":")) {
              let prop = name.slice(1);

              let v = value || prop;

              if (!v.includes("{{")) v = `{{${v}}}`;

              x.push({
                type: ATTRIBUTE,
                name: prop,
                value: v,
              });
              node.removeAttribute(name);
            }
          }
        }
      }
      if (x.length) map[index] = x;
      index++;
      return pickupNode
    });

    return map
  };

  const multi =
    (...fns) =>
    (...args) => {
      for (let fn of fns) {
        let v = fn(...args);
        if (v === false) return false
      }
    };

  const bindAll = (bMap, hydrate = 0, context) => {
    let index = 0;
    return (node) => {
      let k = index;
      let p;
      if (k in bMap) {
        bMap[k].forEach((v) => {
          let x = bind({
            ...v,
            node,
            context,
            hydrate,
          });
          p = x.pickupNode;
        });
        node.$i = index;
      }

      index++;
      return p
    }
  };

  let frag = fragmentFromTemplate(template);
  let map = parse(frag);
  let ds = getDataScript(target);

  if (ds) {
    walk(target, bindAll(map, 1));
  } else {
    walk(frag, bindAll(map));
    beforeMountCallback?.(frag);
    target.prepend(frag);
    update();
  }

  return debounce(() => update(updatedCallback))
};

const childNodes = (node) => {
  let frag = document.createDocumentFragment();
  while (node.firstChild) {
    frag.appendChild(node.firstChild);
  }
  return frag
};

const mergeSlots = (targetNode, sourceNode) => {
  let namedSlots = sourceNode.querySelectorAll("slot[name]");

  namedSlots.forEach((slot) => {
    let name = slot.attributes.name.value;
    let node = targetNode.querySelector(`[slot="${name}"]`);
    if (!node) {
      slot.parentNode.replaceChild(childNodes(slot), slot);
      return
    }
    node.removeAttribute("slot");
    slot.parentNode.replaceChild(node, slot);
  });

  let defaultSlot = sourceNode.querySelector("slot:not([name])");

  if (defaultSlot) {
    defaultSlot.parentNode.replaceChild(
      childNodes(targetNode.innerHTML.trim() ? targetNode : defaultSlot),
      defaultSlot
    );
  }
};

function createDataScript(node) {
  let ds = document.createElement("script");
  ds.setAttribute("type", "application/synergy");
  node.append(ds);
  return ds
}

function serialise(node, state) {
  let ds = getDataScript(node) || createDataScript(node);
  ds.innerText = JSON.stringify(state);
}

const define = (name, factory, template) =>
  customElements.define(
    name,
    class extends HTMLElement {
      async connectedCallback() {
        if (!this.initialised) {
          let config = factory(this);

          if (config instanceof Promise) config = await config;

          let { subscribe, shadow, observe = [] } = config;

          this.connectedCallback = config.connectedCallback;
          this.disconnectedCallback = config.disconnectedCallback;

          const ds = getDataScript(this);

          const { dispatch, getState, onUpdate, flush } = configure(
            {
              ...config,
              state: ds ? JSON.parse(ds.innerText) : config.state,
            },
            this
          );

          let state = getState();

          let observedAttributes = observe.map(pascalToKebab);

          let sa = this.setAttribute;
          this.setAttribute = (k, v) => {
            if (observedAttributes.includes(k)) {
              let { name, value } = attributeToProp(k, v);

              dispatch({
                type: "SET",
                payload: { name, value },
              });
            }
            sa.apply(this, [k, v]);
          };
          let ra = this.removeAttribute;
          this.removeAttribute = (k) => {
            if (observedAttributes.includes(k)) {
              let { name, value } = attributeToProp(k, null);
              dispatch({
                type: "SET",
                payload: { name, value },
              });
            }
            ra.apply(this, [k]);
          };

          observedAttributes.forEach((name) => {
            let property = attributeToProp(name).name;
            let value;

            if (this.hasAttribute(name)) {
              value = this.getAttribute(name);
            } else {
              value = this[property] || state[property];
            }

            Object.defineProperty(this, property, {
              get() {
                return getState()[property]
              },
              set(v) {
                dispatch({
                  type: "SET",
                  payload: { name: property, value: v },
                });
                if (isPrimitive(v)) {
                  applyAttribute(this, property, v);
                }
              },
            });

            this[property] = value;
          });

          let beforeMountCallback;

          if (shadow) {
            this.attachShadow({
              mode: shadow,
            });
          } else {
            beforeMountCallback = (frag) => mergeSlots(this, frag);
          }

          onUpdate(
            render(
              this.shadowRoot || this,
              { getState, dispatch },
              template,
              () => {
                const state = getState();

                serialise(this, state);
                observe.forEach((k) => {
                  let v = state[k];
                  if (isPrimitive(v)) applyAttribute(this, k, v);
                });
                subscribe?.(getState());
                flush();
              },
              beforeMountCallback
            )
          );
          this.initialised = true;

          if (!ds) serialise(this, getState());

          this.connectedCallback?.({ dispatch, getState });
        }
      }
      disconnectedCallback() {
        this.disconnectedCallback?.();
      }
    }
  );

export { define };
