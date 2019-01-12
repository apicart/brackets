import {cloneObject, each, generateHash} from './utils';

export var Brackets = {
	devMode: false
};
export var templateLiteralsEnabled = (function () {
	try {
		eval('`x`');
		return true;
	}
	catch (e) {
		return false;
	}
})();
export var macrosRegularExpression;
export var templateLiteral = templateLiteralsEnabled ? '`' : '\'';
export var components = {
	register: {},
	renderToString: function (componentName, componentDataFromTemplate) {
		var component = components.register[componentName];

		if (typeof component === 'undefined') {
			throw new Error('Brackets: Component "' + componentName + '" was not found.');
		}

		var
			componentHash = generateHash(),
			componentData = component.data ? cloneObject(component.data) : {};

		if (componentDataFromTemplate) {
			each(componentDataFromTemplate, function (key, value) {
				componentData[key] = value;
			});
		}

		var
			templateObject = Brackets.renderToString({
				beforeRender: component.beforeRender,
				cacheKey: componentName,
				componentHash: componentHash,
				data: componentData,
				template: component.template
			}),
			renderedComponents = [{
				componentHash: componentHash,
				data: componentData,
				componentName: componentName
			}].concat(templateObject.templateRuntime.renderedComponents);

		this.renderedComponents = this.renderedComponents.concat(renderedComponents);

		return templateObject.templateString;
	}
};
export var filters = {};
export var macros = {
	breakif: 'if (#0) break;',
	continueif: 'if (#0) continue;',
	component: function (parameters) {
		var
			parametersToArray = parameters[0].split(','),
			componentName = parametersToArray[0],
			componentData;

		parametersToArray.shift();
		componentData = '{' + parametersToArray.join(',') + '}';

		return '_template += _runtime.components.renderToString.call('
			+ '_runtime, \'' + componentName + '\', ' + componentData
		+ ');';
	},
	dump: 'console.log(#0);',
	else: '} else {',
	elseif: '} else if (#0) {',
	for: 'for (var #0) {',
	'/for': '}',
	if: 'if (#0) {',
	'/if': '}',
	js: '#0;',
	var: 'var #0;',
	while: 'while (#0) {',
	'/while': '}'
};


function generateMacrosRegularExpression() {
	macrosRegularExpression = new RegExp(
		/* eslint-disable-next-line no-useless-escape */
		'{{(?:(?:(' + Object.keys(macros).join('|').replace('/', '\/') + ')(?: (.*?))?)|(?:(\\$.*?)))}}'
	);
}


filters.escape = function (variable) {
	var entityMap = {
		'"': '&quot;',
		'&': '&amp;',
		'\'': '&#39;',
		'/': '&#x2F;',
		'<': '&lt;',
		'=': '&#x3D;',
		'>': '&gt;',
		'`': '&#x60;'
	};

	return String(variable).replace(/[&<>"'`=/]/g, function (token) {
		return entityMap[token];
	});
};


Brackets.addComponent = function (name, parameters) {
	components.register[name] = parameters;
	return Brackets;
};


/**
 * @param {string} name
 * @param {function} callback
 */
Brackets.addFilter = function (name, callback) {
	filters[name] = callback;
	return Brackets;
};


/**
 * @param {string} name
 * @param {string|function} replacement
 */
Brackets.addMacro = function (name, replacement) {
	macros[name] = replacement;
	generateMacrosRegularExpression();
	return Brackets;
};


generateMacrosRegularExpression();
Brackets._filters = filters;
Brackets.templateLiteral = templateLiteral;
