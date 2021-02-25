# Prerendering

Pre-rendering is useful when you need to get content rendered immediately as part of the initial page load, without having to wait for JavaScript to build the page first.

Synergy supports pre-rendering and hydration and doesn't care where or how you pre-render your content. In order to pre-render your page, you only need to load it in a browser \(or within a synthetic DOM environment\) and then save the rendered page. Load that same page again and Synergy will hydrate the bindings without modifying the DOM.

