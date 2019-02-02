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
		iteratorObject = {
			iterableLength: 0,
			counter: 0,
			isEven: function () {
				return this.counter % 2 === 0;
			},
			isOdd: function () {
				return Math.abs(this.counter % 2) === 1;
			},
			isFirst: function () {
				return this.counter === 1
			},
			isLast: function () {
				return this.counter === iterableLength
			}
		},
		iterableLength,
		statement,
		keys,
		keysLength,
		key;

	if (['undefined', 'number'].indexOf(typeof iterable) > -1 || iterable === null) {
		return;
	}

	if (Array.isArray(iterable)) {
		iterableLength = Object.keys(iterable).length;

		if ( ! iterableLength) {
			return;
		}

		iteratorObject.iterableLength = iterableLength;
		for (iterator = 0; iterator < iterableLength; iterator ++) {
			iteratorObject.counter ++;
			statement = callback.apply(iteratorObject, [iterator, iterable[iterator]]);

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

		iteratorObject.iterableLength = keysLength;
		for (iterator = 0; iterator < keysLength; iterator ++) {
			iteratorObject.counter ++;
			key = keys[iterator];
			statement = callback.apply(iteratorObject, [key, iterable[key]]);

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
