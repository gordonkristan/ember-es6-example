# ES6 with Ember

This example is meant to show that it's not only possible to use ES6 syntax with Ember, but it's quite easy. Unlike [Ember-CLI](http://www.ember-cli.com/), which only uses the module syntax, this allows all ES6 syntax supported by [this transpiler](https://github.com/termi/es6-transpiler).

## How It Works

This example has 3 main parts, the transpiler, the module loader, and the resolver. Both are fairly simple to write and can be easily integrated into your Ember application.

### The Transpiler

The transpiler used in this project is really just 2 other transpilers combined: a [module transpiler](https://github.com/gordonkristan/es6-module-jstransform) and [transpiler for the rest of the ES6 syntax](https://github.com/termi/es6-transpiler). The module transpiler (originally by andreypopp) uses Facebook's [jstransform](https://github.com/facebook/jstransform) utility to parse and transform the ES6 module syntax _and only the module syntax_. This gives us syntax that can go into the other transpiler and produce ES5 code. And unlike the Traceur compiler, there's no runtime dependency and the output code is quite clean. Wrapping a simple Node script around these transpilers allows your entire app to be compiled into a single file.

### The Module Loader

The module loader is about as simple as it gets. The module transpiler uses a module syntax that looks like AMD combined with CommonJS. The module loader just caches all of the modules and executes them when needed.

### The Resolver

If you're unfamiliar with [Ember's concept of a resolver](http://emberjs.com/api/classes/Ember.DefaultResolver.html), it's really just a way for Ember to find the classes it needs. Ember asks for a specific class (such as `route:index`) and it expects you to find it (for example, `App.IndexRoute`). Ember's default resolver looks for everything on the application's namespace, but we want to avoid that. So similar to Ember App Kit and Ember-CLI, our resolver looks for classes using the module system we defined. The included resolver looks for things in folders corresponding to their hierarchy in the route map. Some examples:

Ember asks for: `route:users.profile.index`
By default Ember uses: `App.UsersProfileIndexRoute`
Our resolver looks for: `routes/users/profile/index.js`

Ember asks for: `controller:users.profile`
By default Ember uses: `App.UsersProfileController`
Our resolver looks for: `controllers/users/profile.js`

Ember asks for: `model:user`
By default Ember uses: `App.User`
Our resolver looks for: `models/user.js`

Ember asks for: `widget:foo.bar.none`
By default Ember uses: `App.FooBarNoneWidget`
Our resolver looks for: `widgets/foo/bar/none.js`

## Caveats

This is a very simplistic approach, so there are a few caveats.

- Circular module dependencies (I don't think Ember-CLI does this either)
- Module and file names can't contain single or double quotes (why would you want to do that anyway?)
- You can't use a function named `require` in the current scope (`window.require()` and `obj.require()` work, but not `require();`)

None of these are unsolvable problems, I just don't think it's worth it to put the effort in to fix them.

## About

This example is written using roughly the same code we use at [greenlight.guru](http://greenlight.guru). I've covered all of the big areas, but I certainly haven't thought of every scenario. If you find something isn't working for you, feel free to let me know or submit a pull request. This is mainly meant to be a proof of concept, but I have no problem expanding upon it if needed.
