import { utils } from '../../shared/utils';
import { getMacros } from '../../runtime/macros';


/**
 * @param {[]} tokenMatchArray
 * @return {string}
 */
export function processMacro(tokenMatchArray) {
	var
		macroName = tokenMatchArray[0],
		macros = getMacros(),
		parsedToken;

	tokenMatchArray.shift();

	if (utils.isString(macros[macroName])) {
		parsedToken = macros[macroName];

		utils.each(tokenMatchArray, function (tokenMatchPartKey, tokenMatchPart) {
			parsedToken = parsedToken.replace(new RegExp('#' + tokenMatchPartKey), tokenMatchPart);
		});

	} else {
		parsedToken = macros[macroName](tokenMatchArray);
	}

	return parsedToken;
}
