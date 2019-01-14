/**
 * @param {{}} obj
 * @return {{}}
 */
export function cloneObject(obj) {
	var newObject = {};

	Object.keys(obj).forEach(function (key) {
		newObject[key] = obj && typeof obj === Object(obj) ? cloneObject(obj[key]) : obj[key];
	});

	return newObject;
}


/**
 * @param {{}|[]} iterable
 * @param {function} callback
 */
export function each(iterable, callback) {
	var
		iterator,
		iterableLength,
		statement,
		keys,
		keysLength,
		key;

	if (Array.isArray(iterable)) {
		iterableLength = iterable.length;

		if ( ! iterableLength) {
			return;
		}

		for (iterator = 0; iterator < iterableLength; iterator ++) {
			statement = callback(iterator, iterable[iterator]);

			if (statement === false) {
				break;
			}
		}

	} else {
		keys = Object.keys(iterable);
		keysLength = keys.length;

		if ( ! keys.length) {
			return;
		}

		for (iterator = 0; iterator < keysLength; iterator ++) {
			key = keys[iterator];
			statement = callback(key, iterable[key]);

			if (statement === false) {
				break;
			}
		}
	}
}


/**
 * @param {number} length
 * @returns {string}
 */
export function generateHash(length) {
	length = length || 10;
	length += 2;
	return Math.random().toString(36).substring(2, length);
}
