export default Ember.DefaultResolver.extend({

	/**
	 * By default, Ember uses this function to look up most objects (routes, controllers, views, components, etc).
	 * We'll override it to look for that item in our modules first. If we can't find a module that matches
	 * the name, we'll call the super method to user the default behavior.
	 */
	resolveOther(parsed) {
		// First, check our special cases
		if (parsed.type === 'data_adapter' && parsed.name === 'main') {
			return window.require('util/data_adapter').default;
		}
		// If it's not a special case, underscore and pluralize the type name for the directories
		const pluralizedType = parsed.type.underscore() + 's';
		// Now dasherize the name so it matches the files and replace dots with slahes
		const moduleName = parsed.name.dasherize().replace(/\./g, '/');
		// Try to resolve the module
		const module = window.require(`${pluralizedType}/${moduleName}`);
		// If it worked, return it. Otherwise call _super
		return (module && module.default) || this._super.apply(this, arguments);
	}

});
