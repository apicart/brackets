import {Brackets} from '../../shared/variables';


var macros = {
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
	foreach: function (parameters) {
		var
			parametersToArray = parameters[0].split(','),
			iterableVariableName = parametersToArray[0],
			keyValueIsPassed = parametersToArray.length === 3,
			forEachFunctionKeyParameterName = keyValueIsPassed ? parametersToArray[1].trim() : 'key',
			forEachFunctionValueParameterName = (keyValueIsPassed ? parametersToArray[2] : parametersToArray[1]).trim(),

			part1 = '_runtime.utils.each(' + iterableVariableName,
			part2 = ', function (' + forEachFunctionKeyParameterName + ', ' + forEachFunctionValueParameterName +') {';

		return part1 + part2;
	},
	'/foreach': '});',
	if: 'if (#0) {',
	'/if': '}',
	js: '#0;',
	var: 'var #0;',
	while: 'while (#0) {',
	'/while': '}'
};


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
	macrosRegularExpression = new RegExp(
		/* eslint-disable-next-line no-useless-escape */
		'{{(?:(?:(' + Object.keys(macros).join('|').replace('/', '\/') + ')(?: (.*?))?)|(?:(\\$.*?)))}}'
	);
}


generateMacrosRegularExpression();
