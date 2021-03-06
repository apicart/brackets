import { utils } from '../../shared/utils';


/**
 * @param {[]} tokenMatchArray
 * @return {string}
 */
export function processVariable(tokenMatchArray) {
	var
		applyEscapeFilter = true,
		filterArray,
		filterName,
		filterParameters = [],
		tokenFullMatch = tokenMatchArray[0],
		tokenFullMatchArray = tokenFullMatch.split('|'),
		variable = tokenFullMatchArray[0].replace('$', '');

	tokenFullMatchArray.shift();

	if (tokenFullMatchArray.length) {
		utils.each(tokenFullMatchArray, function (key, filter) {
			filterArray = filter.split(':');
			filterName = filterArray[0] || null;

			if (filterName === 'noescape') {
				applyEscapeFilter = false;
				return;
			}

			filterParameters = utils.isString(filterArray[1]) ? filterArray[1].split(',') : [];
			filterParameters.unshift(variable);

			variable = '_templateAdd([' + filterParameters + '], \'' + filterName + '\')';
		});
	}

	if (applyEscapeFilter) {
		variable = '_templateAdd(' + variable + ')';
	}

	return '_template += ' + variable + ';';
}
