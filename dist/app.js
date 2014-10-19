(function() {
	var UNEXECUTED_MODULES = {};
	var EXECUTED_MODULES = {};

	window.define = function(name, fn) {
		UNEXECUTED_MODULES[name] = fn;
	};

	window.require = function(name) {
		if (!EXECUTED_MODULES[name]) {
			if (!UNEXECUTED_MODULES[name]) {
				return undefined;
			}

			EXECUTED_MODULES[name] = { exports: {} };
			UNEXECUTED_MODULES[name](EXECUTED_MODULES[name]);
		}

		return EXECUTED_MODULES[name].exports;
	};

	window.getAllModuleNames = function() {
		var name, names = [];

		for (name in UNEXECUTED_MODULES) {
			if (UNEXECUTED_MODULES.hasOwnProperty(name)) {
				names.push(name);
			}
		}

		return names;
	};

})();
define('app', function(module) {
var Resolver =require('util/resolver')["default"];
var ROOT_ELEMENT =require('util/config').ROOT_ELEMENT;

var App = Ember.Application.create({
	rootElement: ROOT_ELEMENT,
	Resolver: Resolver
});

var routeMap =require('router')["default"];
App.Router.map(routeMap);

module.exports["default"] = App;
});

define('controllers/index', function(module) {
module.exports["default"] = Ember.ArrayController.extend({

	selectedColor: null,

	style: function() {
		return (("color: " + (this.get('selectedColor'))) + ";");
	}.property('selectedColor'),

	randomizeColor: function() {
		var randomIndex = Math.floor(Math.random() * this.get('length'));
		this.set('selectedColor', this.objectAt(randomIndex));
	}.observes('[]').on('init'),

	actions: {
		changeColor: function() {
			this.randomizeColor();
		}
	}

});
});

define('router', function(module) {
module.exports["default"] = function routingFunction() {

}
});

define('routes/index', function(module) {
module.exports["default"] = Ember.Route.extend({
	model: function() {
		return ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
	}
});
});

define('util/config', function(module) {
var ROOT_ELEMENT = module.exports.ROOT_ELEMENT = '#app';
});

define('util/data_adapter', function(module) {
module.exports["default"] = EG.DataAdapter.extend({

	/**
	 * This allows the Ember Inspector Data tab to work with your new module system.
	 */
	getModelTypes: function() {var this$0 = this;
		var container = this.get('container');

		return window.getAllModuleNames().
			filter(function(name)  {
				return (name.startsWith('models/') && this$0.detect(window.require(name).default));
			}).
			map(function(name)  {
				var className = name.substring('models/'.length);

				return {
					klass: container.lookupFactory(("model:" + className)),
					name: className.underscore().split(/_/g).map(function(w)  {return w.capitalize()}).join(' ')
				};
			});
	}

});
});

define('util/resolver', function(module) {
module.exports["default"] = Ember.DefaultResolver.extend({

	/**
	 * By default, Ember uses this function to look up most objects (routes, controllers, views, components, etc).
	 * We'll override it to look for that item in our modules first. If we can't find a module that matches
	 * the name, we'll call the super method to user the default behavior.
	 */
	resolveOther: function(parsed) {
		// First, check our special cases
		if (parsed.type === 'data_adapter' && parsed.name === 'main') {
			return window.require('util/data_adapter').default;
		}
		// If it's not a special case, underscore and pluralize the type name for the directories
		var pluralizedType = parsed.type.underscore() + 's';
		// Now dasherize the name so it matches the files and replace dots with slahes
		var moduleName = parsed.name.dasherize().replace(/\./g, '/');
		// Try to resolve the module
		var module = window.require((("" + pluralizedType) + ("/" + moduleName) + ""));
		// If it worked, return it. Otherwise call _super
		return (module && module.default) || this._super.apply(this, arguments);
	}

});

});

require('app');