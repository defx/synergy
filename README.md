# [synergy](https://synergyjs.org)

## [![npm](https://img.shields.io/npm/v/synergy.svg)](http://npm.im/synergy) [![Build Status](https://travis-ci.com/defx/synergy.svg?branch=master)](https://travis-ci.com/defx/synergy) [![Coverage Status](https://coveralls.io/repos/github/defx/synergy/badge.svg?branch=master)](https://coveralls.io/github/defx/synergy?branch=master) [![gzip size](https://img.badgesize.io/https://unpkg.com/synergy/dist/synergy.min.js?compression=gzip&label=gzip)]()

Synergy is a JavaScript library for building Web Components

## Features

- Simple templates for declarative data & event binding
- Reactive data bindings update your view efficiently and
  automatically
- Full component workflow using standard Web Components
- Small footprint (~4k)
- No special tooling required (e.g., compilers, plugins)
- Minimal learning curve (almost entirely standard HTML, JS,
  and CSS!)

[Learn how to use Synergy in your own project](https://synergyjs.org/learn/introduction).

## Browser Support

Works in any
[modern browser](https://caniuse.com/mdn-javascript_builtins_proxy_proxy)
that supports JavaScript Proxy.

## Installation

Synergy is available from npm:

```bash
$ npm i synergy
```

You can also import Synergy directly in the browser via CDN:

```html
<script type="module">
  import { define } from "https://unpkg.com/synergy@6.0.0";
</script>
```

## Documentation

You can find the Synergy documentation
[on the website](https://synergyjs.org/).

## Example

### Step 1. Define your custom element

```html
<script type="module">
  import { define } from "https://unpkg.com/synergy@6.0.0";

  define("hello-world", ({ name }) => ({ name }), "<p>Hello {{ name }}</p>");
</script>
```

### Step 2. Use the custom element

```html
<hello-world name="kimberley"></hello-world>
```

This example will render "Hello Kimberley" into a container
on the page.

You'll notice that everything here is valid HTML and JS, and
you can copy and paste this example and run it directly in
the browser with no need to compile or install anything
special to make it work.

### License

Synergy is [MIT licensed](./LICENSE).
