# Composing components

Making a component is great but when we start to compose components together the possibilities are endless.

You might be suprised to learn that, just like our simple component example, its also possible to create a multi-page application using nothing more than a simple http server.

To start the example simple run `npx serve` from this directory and then open you browser and paste the server address into the URL bar.

If you look at the file structure you can see that we have an `index.html` file for our main page, and this loads in our top-level `my-app` component. Take a look at `components/app.js` to see how the my-app component imports the myCounter component:

```js
import "../myCounter.js"
```

This type of import is used when you're only interested in the _side-effects_ of the imported module which, in our case, are ensuring that the `my-counter` component is defined and available to use. Once a component imports another self-defining component in this way, we can be sure its safe to go ahead and reference that component within our own template.

Great! Now we have a simple way to compose components together that doesn't even require a build step! Of course, you may _choose_ to use a build step because you want to use Typescript or a bundler or minifier for example, but that's entirely up to you to decide based on the particular requirements of your project. Synergy doesn't require it and the purpose of these tutorials is to learn what Synergy can do from first principles, which means keeping things simple and keeping us as close to the platform as possible.

Now before you go off an create a whole websites worth of components, its good to know that there are actually two types of components in Synergy! In the next chapter of this tutorial we will learn exactly what they are and how you can benenfit from using both, so keep reading to find out more.
