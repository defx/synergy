# [synergy](https://synergyjs.org)

## [![npm](https://img.shields.io/npm/v/synergy.svg)](http://npm.im/synergy) [![Build Status](https://travis-ci.com/defx/synergy.svg?branch=master)](https://travis-ci.com/defx/synergy) [![Coverage Status](https://coveralls.io/repos/github/defx/synergy/badge.svg?branch=master)](https://coveralls.io/github/defx/synergy?branch=master) [![gzip size](https://img.badgesize.io/https://unpkg.com/synergy/dist/synergy.min.js?compression=gzip&label=gzip)]()

Synergy is a tiny runtime library for building web
user interfaces

## Features

- Simple templates for declarative data & event
  binding
- Reactive data bindings update your view
  efficiently and automatically
- Full component workflow using standard Web
  Components
- Small footprint (~4k)
- No special tooling required (e.g., compilers,
  plugins)
- Minimal learning curve (almost entirely standard
  HTML, JS, and CSS!)
- Seamless pre-rendering & hydration for great
  performance and SEO

[Learn how to use Synergy in your own project](https://synergyjs.org/getting-started.html).

## Browser Support

Works in any
[modern browser](https://caniuse.com/mdn-javascript_builtins_proxy_proxy)
that supports JavaScript Proxy.

## Installation

Synergy doesn't require any special toolchain,
compiler, plugins etc. Its a tiny (~4k) package
that gives you everything you need to start
building directly in the browser.

The quickest way to get started is to import the
Synergy package directly from a CDN.

### Unpkg CDN

```html
<script type="module">
  import synergy from 'https://unpkg.com/synergy@1.5.0';
</script>
```

You can also install directly into your project
using NPM.

### NPM

```bash
$ npm i synergy
```

## Documentation

You can find the Synergy documentation
[on the website](https://synergyjs.org/documentation).

You can improve it by sending pull requests to
[this repository](https://github.com/synergyjs/synergyjs.org).

## Example

### Step 1. Define your custom element

```html
<script type="module">
  import define from 'https://unpkg.com/synergy@1.5.0';

  define('hello-world', ({ name }) => ({ name }));
</script>
<template id="hello-world">
  <p>Hello {{ name }}</p>
</template>
```

### Step 2. Use the custom element

```html
<hello-world name="kimberley"></hello-world>
```

This example will render "Hello Kimberley" into a
container on the page.

You'll notice that everything here is valid HTML
and JS, and you can copy and paste this example
and run it directly in the browser with no need to
compile or install anything special to make it
work.

### License

Synergy is [MIT licensed](./LICENSE).
