import {filters} from '../../shared/variables';
import {each} from '../../shared/utils';

/**
 * @param {[]} tokenMatchArray
 * @return {string}
 */
export function processVariable(tokenMatchArray) {
	var
		applyEscapeFilter = true,
		filterArray,
		filterFunction,
		filterName,
		filterParameters = [],
		tokenFullMatch = tokenMatchArray[0],
		tokenFullMatchArray = tokenFullMatch.split('|'),
		variable = tokenFullMatchArray[0].replace('$', '');

	tokenFullMatchArray.shift();

	if (tokenFullMatchArray.length) {
		each(tokenFullMatchArray, function (key, filter) {
			filterArray = filter.split(':');
			filterName = filterArray[0];

			if (filterName === 'noescape') {
				applyEscapeFilter = false;
				return;
			}

			filterParameters = typeof filterArray[1] === 'string' ? filterArray[1].split(',') : [];
			filterParameters.unshift(variable);
			filterFunction = filters[filterName];

			if (typeof filterFunction === 'undefined') {
				throw 'Undefined filter: "' + filterName + '".';
			}

			variable = 'Brackets._filters.' + filterName + '(' + filterParameters.join(',') +')';
		});
	}

	if (applyEscapeFilter) {
		variable = 'Brackets._filters.escape(' + variable + ')';
	}

	return '_template += ' + variable + ';';
}
