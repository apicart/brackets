import {macros} from '../../shared/variables';
import {each} from '../../shared/utils';

/**
 * @param {[]} tokenMatchArray
 * @return {string}
 */
export function processMacro(tokenMatchArray) {
	var
		macroName = tokenMatchArray[0],
		parsedToken;

	tokenMatchArray.shift();

	if (typeof macros[macroName] === 'string') {
		parsedToken = macros[macroName];

		each(tokenMatchArray, function (tokenMatchPartKey, tokenMatchPart) {
			parsedToken = parsedToken.replace(new RegExp('#' + tokenMatchPartKey), tokenMatchPart);
		});

	} else {
		parsedToken = macros[macroName](tokenMatchArray);
	}

	return parsedToken;
}
