# meteor-altboiler - 0.4.0

A non render-blocking alternative to the Meteor-core boilerplate-generator package.

Loading meteor on slow networks sometimes can take more than a minute. It is huge. This makes for an awful UX. With this package you can server static HTML first and then load meteor in the background. You could for example serve a loading screen first. Or you could also render the whole site without the parts that need a connection to the server first.

[You can see a demo page here](http://altboiler.meteor.com/).

## Issues

Don't hesitate to create an Issue just check the [TODO](https://github.com/Kriegslustig/meteor-altboiler#todo) section first. If you're not sure if it's a bug or an issue with your set up, just PM me. :)

## Table of Contents

- [Installing](#installing)
- [Usage](#usage)
- [API](#api)
  - [`altboiler.config`](#altboilerconfigconfig---server)
  - [`altboiler.set`](#altboilersetconfig---server)
- [Configuration](#configuration)
- [TODO](#todo)

## Installing

```bash
meteor install kriegslustig:altboiler
```

## Usage

```js
// Render a file saved in private/myLoadScreen.html as the loading screen
altboiler.config({
  action: Assets.getText('myLoadScreen.html'),

  // Render a file saved in private/myLoadScript.js as JS inside the loading screen
  js: Assets.getText('myLoadScript.js'),

  // Render a file saved in private/myLoadStyles.css as CSS inside the loading screen
  css: Assets.getText('myLoadScript.css')
})


```

## API

The package installs two `connect`-handles. One on `WebApp.rawConnectHandlers` and one on `WebApp.connectHandlers`. The latter is used to serve the loader (load-screen). It simply doesn't call the `next` callback to prevent the meteor core from loading. The former, raw handler is for the app-script. It compiles all files inside the manifest and serves it as one file.

When a client hits the server it responds with the rendered altboiler `Boilerplate`. Its basically rendering [`assets/main.html`](https://github.com/Kriegslustig/meteor-altboiler/blob/master/assets/main.html). Here's an overview of what happens inside;

* First your styles (`altboiler.configuration.css`) gets loaded
* The loader-script ([`assets/loader`](https://github.com/Kriegslustig/meteor-altboiler/blob/master/assets/loader.js)) gets loaded
* Your script loads (`altboiler.configuration.js`)
* All the `altboiler.configuration.onLoad` get installed
* The return value of `altboiler.configuration.action` gets loaded
* The app-script is loaded over the raw connect-handler
* `onLoad` hook triggers

### altboiler.config(config) - *Server*

**config** - `Object`: An object holding configuration options. They will be merged with the current configuration. When properties already exist, the new one will be used. [Check the **configuration-section** for more info](#configuration)

This configures altboiler. The configuration is saved in `altboiler.configuration`.

##### When to call altboiler.config

Inside the action you might render a template and bind some data-context. To make the server's first response as quick as possible, you'll want to decrease the times a loading template is rendered. If your data is static, that's easy to do. You can just put the call to `altboiler.config` inside a `Meteor.startup` call and pass the rendered template instead of passing the render function. That way the template is only rendered once. If you are displaying data that could change, you'll need to put the call to `altboiler.config` outside of the `Meteor.startup` call. This makes things slower dough. Now every time a client requests your site, the template is rendered server-side. What you could do is use a [`cursor.observe`](https://docs.meteor.com/#/full/observe) and then call `altboiler.config` every time something changes. That'll make responses just as fast as they were before.

### altboiler.set(config) - *Server*

**config** - `Object`: An object holding configuration options. They will be merged with the current configuration. When properties already exist, the temp one will be used. [Check the **configuration-section** for more info](#configuration)

This function sets temporary configuration options. The object passed to this function is used to render the boilerplate once and is emptied after that. You might also want to use different loading screens for different routes. That's what `altboiler.set` is for. Here's a minimal example using `iron:router`:

`server/routes.js`
```
Router.route('/', function () {
  altboiler.set({
    action: 'Welcome to the front page!'
  })
  this.next()
}, {where: 'server'})
```

`client/routes.js`
```
Router.route('/', {
  name: 'home'
})
```

## Configuration

### css - *Array || String*
An array of strings of CSS or a string of CSS. The CSS added via this option will be rendered into the loading template. The best way to use this is with [`Assets`](http://docs.meteor.com/#/full/assets).

#### js - *Array || String || Function*
Same as the css option. The configured JS will be executed right after `assets/loader.js`. The array may also contain functions. `toString` will be called on these. It is then executed after the HTML and CSS is loaded. There is a little problem with this tough. The HTML is not guaranteed to be rendered when this is loaded tough. So you might want to wrap you script inside a `setTimeout(someFunc, 0)`.

#### action - *String || Function*
This is what will be served to all routes before meteor. The best way to use this, is to create a `.html` file as an asset and then call `Assets.getText`. You might also want to use [`meteorhacks:SSR`](https://github.com/meteorhacks/meteor-ssr).

#### onLoad - *Array || String || Function*
An array of strings or functions to be triggered when the app-scripts are loaded. The functions have to take one argument `next` which calls the next function inside the `onLoad` queue. You can interact with the script inside the `boilerplate.configuration.js`. You may get variables from the `window` object, instead of searching them inside the global-scope. This is because the onLoad listener is installed before `boilerplate.configuration.js` is executed. So you'll get an `is undefined` error when you try to get a variable defined inside `boilerplate.configuration.js` directly.

#### showLoader - *Array || String || Function || Boolean*
This can basically be anything. If you pass an array, `_.every` is used to check every values `truthyness`. The configured object is inside the `connectHandlers.use` call. The loader is served if the/all check/s return/s true. You might need to use this to circumvent altboiler when serving resources. Normally this isn't necessary, because the `connectHandlers.use` call is deferred using `setTimeout`. But there could be cases where you too want to make sure you `connectHandlers.use` call is made last. Try to avoid this

## TODO
* Go over the README
