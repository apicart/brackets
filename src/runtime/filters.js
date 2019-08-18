import { Brackets } from '../shared/variables';


var filters = {};


/**
 * @param {string} name
 * @param {function} callback
 */
export function addFilter(name, callback) {
	if (getFilter(name, false)) {
		throw new Error('Brackets: Filter "' + name +'" is already defined.');
	}

	filters[name] = callback;
	return Brackets;
}


/**
 * @param {string} name
 * @param {boolean|null} required
 * @return {function|null}
 */
export function getFilter(name, required) {
	if (required !== false && ! (name in filters)) {
		throw new Error('Brackets: Filter "' + name + '" not found.');
	}

	return filters[name] || null;
}


/**
 * @return {{}}
 */
export function getFilters() {
	return filters;
}


addFilter('escape', function (variable, context) {
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
});
