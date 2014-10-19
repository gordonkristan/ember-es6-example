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