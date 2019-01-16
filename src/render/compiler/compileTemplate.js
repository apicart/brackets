import {templateLiteral} from '../../shared/variables';
import {each} from '../../shared/utils';
import {processVariable} from './processors/procesVariable';
import {processMacro} from './processors/processMacro';
import {getMacros} from '../runtime/macros';


var variableMatchRegularExpression = /^\$/;

/**
 * @param {{}} tokens
 * @param {{}} templateParametersNames
 * @return {Function}
 */
export function compileTemplate(tokens, templateParametersNames) {
	var
		macroTokenArray,
		macroTokenFirstPart,
		templateString = 'var _template = \'\';';

	each(tokens.text, function (tokenKey, tokenText) {
		templateString += '_template += ' + templateLiteral + tokenText + templateLiteral + ';';

		if (tokenKey in tokens.macros) {
			macroTokenArray = tokens.macros[tokenKey];
			macroTokenFirstPart = macroTokenArray[0];

			if (macroTokenFirstPart.match(variableMatchRegularExpression)) {
				templateString += processVariable(macroTokenArray);

			} else if (macroTokenFirstPart in getMacros()) {
				templateString += processMacro(macroTokenArray);

			} else {
				throw 'Unknown token: "' + macroTokenFirstPart + '"';
			}
		}
	});

	templateString += 'return _template;';

	return new Function(templateParametersNames.join(','), templateString);
}