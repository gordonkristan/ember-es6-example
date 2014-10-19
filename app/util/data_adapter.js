export default EG.DataAdapter.extend({

	/**
	 * This allows the Ember Inspector Data tab to work with your new module system.
	 */
	getModelTypes() {
		const container = this.get('container');

		return window.getAllModuleNames().
			filter((name) => {
				return (name.startsWith('models/') && this.detect(window.require(name).default));
			}).
			map((name) => {
				const className = name.substring('models/'.length);

				return {
					klass: container.lookupFactory(`model:${className}`),
					name: className.underscore().split(/_/g).map((w) => w.capitalize()).join(' ')
				};
			});
	}

});