import { Brackets } from '../shared/variables';


var
	macros = {
		break: 'break;',
		breakIf: 'if (#0) break;',
		continue: 'continue;',
		continueIf: 'if (#0) continue;',
		component: function (parameters) {
			var
				parametersToArray = parameters[0].split(','),
				componentName = parametersToArray[0],
				componentData;

			parametersToArray.shift();
			componentData = '{' + parametersToArray.join(',') + '}';
			return '_template += _runtime.renderComponent(\'' + componentName + '\', ' + componentData + ');';
		},
		dump: 'console.log(#0);',
		else: '} else {',
		elseif: '} else if (#0) {',
		for: 'for (var #0) {',
		'/for': '}',
		foreach: function (parameters) {
			parameters = parameters[0].split('as');

			var callbackFunctionParameters = parameters[1].trim();

			if (parameters[1].split(',').length === 1) {
				callbackFunctionParameters = 'key, ' + callbackFunctionParameters;
			}

			return '_runtime.utils.each(' + parameters[0].trim() + ', function (' + callbackFunctionParameters + ') {';
		},
		'/foreach': '});',
		if: 'if (#0) {',
		'/if': '}',
		js: '#0;',
		returnFalseIf: 'if (#0) return false;',
		returnIf: 'if (#0) return;',
		var: 'var #0;',
		while: 'while (#0) {',
		'/while': '}'
	},
	openingDelimiter,
	closingDelimiter;

export var macrosRegularExpression;


/**
 * @param {string} name
 * @param {string|function} replacement
 */
export function addMacro(name, replacement) {
	if (name in macros) {
		throw new Error('Brackets: Macro "' + name +'" is already defined.');
	}

	macros[name] = replacement;
	generateMacrosRegularExpression();

	return Brackets;
}


/**
 * @return {{}}
 */
export function getMacros() {
	return macros;
}


function generateMacrosRegularExpression() {
	// First part matches macros, second part after | matches variables
	macrosRegularExpression = new RegExp(
		openingDelimiter
			/* eslint-disable-next-line no-useless-escape */
			+ ' *(?:(?:(' + Object.keys(macros).join('|').replace('/', '\/') + ')(?: (.*?))?) *| *(?:(\\$.*?))) *'
		+ closingDelimiter
	);
}


export function initMacros(config) {
	openingDelimiter = config.delimiters[0];
	closingDelimiter = config.delimiters[1];
	generateMacrosRegularExpression();
}
