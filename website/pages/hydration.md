# Hydration

Synergy components serialise their data inside a script element  each time that their viewmodel changes and merge any deserialised data back into their viewmodel during instantion. This allows you to capture the current state of one or more components in a page at any point in time and then reload that into a browser later to effectively resume from where you left off.

Just remember that data serialisation can increase the size of your page significantly, so if you have a large number of components that need to be prerendered but _not_ rehydrated (e.g., components that have no event bindings and never need to update after the first render), then you should strip out both the data scripts and the component definitions for those particular components to achieve the best possible performance.
