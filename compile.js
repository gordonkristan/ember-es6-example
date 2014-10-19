var fs = require('fs');
var path = require('path');
var readdir = require('fs-readdir-recursive');
var moduleTransform = require('es6-module-jstransform');
var es6transpiler = require('es6-transpiler');

// Allow configurable paths
var APP_DIRECTORY = process.cwd() + '/app';
var OUTPUT_FILE = process.cwd() + '/dist/app.js';
var MODULE_LOADER = process.cwd() + '/module_loader.js';

// Cache modules to allow this to be run as part of a watch task.
var LAST_COMPILE = 0;
var MODULE_CACHE = {};

// Point to the first module to be run when the app starts.
var MAIN_MODULE = 'app';

function compile() {
	console.log('Transpiling app...');
	compileApp();
	LAST_COMPILE = Date.now();
	console.log('...done. App written to ' + OUTPUT_FILE);
}

function compileApp() {
	var moduleNames = findModules();

	// Compile the modules and put them in our cache
	compileModules(moduleNames);
	// Write the module contents to the output file
	concatenateModules(moduleNames);
}

function concatenateModules(moduleNames) {
	// Append module loader first (while creating or clearing file)
	var moduleLoaderContents = fs.readFileSync(MODULE_LOADER, 'utf8');
	fs.writeFileSync(OUTPUT_FILE, moduleLoaderContents);

	// Append every module to it
	moduleNames.forEach(function(moduleName) {
		fs.appendFileSync(OUTPUT_FILE, MODULE_CACHE[moduleName]);
	});

	// Require the main module to run the script
	if (MAIN_MODULE) {
		fs.appendFileSync(OUTPUT_FILE, '\nrequire(\'' + MAIN_MODULE + '\');');
	}
}

function compileModules(moduleNames) {
	var changedModuleNames = getChangedModules(moduleNames);
	console.log('Re-compiling the following modules: ' + changedModuleNames.join(', '));

	// Transpile each module and store them in the cache
	changedModuleNames.forEach(function(moduleName) {
		MODULE_CACHE[moduleName] = compileSingleModule(moduleName);
	});
}

function findModules() {
	// Find all of the JS files and strip the .js extension
	return readdir(APP_DIRECTORY).filter(function(name) {
		return name.substring(name.length - 3) === '.js';
	}).map(function(name) {
		return name.substring(0, name.length - 3);
	});
}

function getChangedModules(moduleNames) {
	// Filter out modules that haven't been changed since our last compile
	return moduleNames.filter(function(moduleName) {
		var modulePath = APP_DIRECTORY + path.sep + moduleName + '.js';
		var stat = fs.statSync(modulePath);
		return (stat.mtime.getTime() > LAST_COMPILE);
	});
}

function compileSingleModule(moduleName) {
	var modulePath = APP_DIRECTORY + path.sep + moduleName + '.js';
	var moduleContents = fs.readFileSync(modulePath, 'utf8');
	return convertES6Syntax(convertModuleSyntax(moduleName, moduleContents));
}

function convertModuleSyntax(moduleName, moduleContents) {
	try {
		var converted = moduleTransform(moduleContents).code;
		var modulePath = APP_DIRECTORY + path.sep + moduleName + '.js';
		converted = normalizeModuleNames(modulePath, converted);

		return '\n' +
			'define(\'' + moduleName + '\', function(module) {\n' +
				converted + '\n' +
			'});\n';
	} catch (error) {
		console.error('Error while converting module syntax. Module contents:\n' + moduleContents);
		throw error;
	}
}

function normalizeModuleNames(modulePath, moduleContents) {
	// require('{matched_text}') -- single or double quote
	var requirePattern = /\srequire\((?:'|")([^'"]+?)(?:'|")\)/g;

	// Strip the filename from the module path, leaving only the directory (no trailing slash)
	var moduleDirectoryPath = modulePath.substring(0, modulePath.lastIndexOf(path.sep));

	// Find very instance of require('{name}') and normalize the {name} part to be relative to the root directory
	return moduleContents.replace(requirePattern, function(fullMatch, requiredModulePath) {
		// Get something like: /Users/foo/Desktop/project/app/routes/users/../../util/file.js
		var fullFilePath = moduleDirectoryPath + path.sep + requiredModulePath + '.js';
		// Remove the relative spots and get: /Users/foo/Desktop/project/app/util/file.js
		var normalizedFilePath = path.resolve(fullFilePath);
		// Remove the file extension and leading path to get the module name: util/file
		var requiredModuleName = normalizedFilePath.substring(APP_DIRECTORY.length + 1, normalizedFilePath.length - 3);
		// Replace the text in the require statement with the module name instead of the module path
		return 'require(\'' + requiredModuleName.replace(/\\/g, '/') + '\')';
	});
}

function convertES6Syntax(moduleContents) {
	var converted = es6transpiler.run({
		src: moduleContents,
		disallowUnknownReferences: false
	});

	if (converted.errors.length > 0) {
		console.error('Errors while converting ES6 syntax.');
		converted.errors.forEach(function(error) {
			console.error(error);
		});

		throw new Error('Couldn\'t convert ES6 syntax for module with contents:\n' + moduleContents);
	}

	return converted.src;
}

// Replace/remove the following line to register this task with the task runner of your choice.
compile();