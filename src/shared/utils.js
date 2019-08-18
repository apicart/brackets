export var utils = {};


/**
 * @param {{}} obj
 * @return {{}}
 */
utils.cloneObject = function (obj) {
	var newObject = {};

	Object.keys(obj).forEach(function (key) {
		newObject[key] = obj && typeof obj === Object(obj) ? utils.cloneObject(obj[key]) : obj[key];
	});

	return newObject;
};


/**
 * @param {Element|NodeList|string} obj
 * @return {[]}
 */
utils.getElementsAsArray = function (elementOrSelector) {
	var targetElements = [];

	if (utils.isString(elementOrSelector)) {
		targetElements = document.querySelectorAll(elementOrSelector);

	} else if (utils.isElement(elementOrSelector)) {
		targetElements = [elementOrSelector];

	} else if (elementOrSelector instanceof NodeList || Array.isArray(elementOrSelector)) {
		targetElements = elementOrSelector;

	} else {
		throw new Error('Brackets: unsupported type for parameter el.');
	}

	return targetElements;
};


/**
 * @returns {{}}
 */
utils.mergeObjects = function () {
	var
		newObject = {},
		iterable = Array.prototype.slice.call(arguments);

	utils.each(iterable, function (objectKey, object) {
		utils.each(object, function (key, value) {
			newObject[key] = ! (key in newObject) || ! utils.isObject(value)
				? value
				: utils.mergeObjects(newObject[key], value);
		});
	});

	return newObject;
};


/**
 * @param {*} data
 * @returns {boolean}
 */
utils.isObject = function (data) {
	return ! utils.isDefined(data) || data === null || Array.isArray(data)
		? false
		: typeof data === 'object';
};


/**
 * @param {*} data
 * @returns {boolean}
 */
utils.isElement = function (data) {
	return data instanceof Element;
};


/**
 * @param {*} data
 * @returns {boolean}
 */
utils.isFunction = function (data) {
	return typeof data === 'function';
};


/**
 * @param {*} data
 * @returns {boolean}
 */
utils.isDefined = function (data) {
	return typeof data !== 'undefined';
};


/**
 * @param {*} data
 * @returns {boolean}
 */
utils.isString = function (data) {
	return typeof data === 'string';
};


/**
 * @param {{}|[]} iterable
 * @param {function} callback
 */
utils.each = function (iterable, callback) {
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
				return this.counter === 1;
			},
			isLast: function () {
				return this.counter === this.iterableLength;
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
};


/**
 * @param {number} length
 * @returns {string}
 */
utils.generateHash = function (length) {
	length = length || 10;
	return Math.random().toString(36).substring(2, length + 2);
};
