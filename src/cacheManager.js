export var cacheManager = {
	cache: {}
};


/**
 * @param {string} region
 * @param {string} cacheKey
 * @returns {*}
 */
cacheManager.getCache = function (region, cacheKey) {
	if ( ! cacheManager.hasCache(region, cacheKey)) {
		return null;
	}

	return cacheManager.cache[region][cacheKey];
};


/**
 * @param {string} region
 * @param {string} cacheKey
 * @param {*} cache
 * @returns {{cache: {}}}
 */
cacheManager.setCache = function (region, cacheKey, cache) {
	if ( ! cacheManager.hasCacheRegion(region)) {
		cacheManager.cache[region] = {};
	}

	if ( ! cacheManager.hasCache(region, cacheKey)) {
		cacheManager.cache[region][cacheKey] = cache;
	}

	return cacheManager;
};


/**
 * @param {string} region
 * @returns {boolean}
 */
cacheManager.hasCacheRegion = function (region) {
	return region in cacheManager.cache;
};


/**
 * @param {string} region
 * @param {string} cacheKey
 * @returns {boolean}
 */
cacheManager.hasCache = function (region, cacheKey) {
	if ( ! cacheManager.hasCacheRegion(region)) {
		return false;
	}

	return cacheKey in cacheManager.cache[region];
};


/**
 * @param {string} region
 * @param {string} cacheKey
 * @returns {void}
 */
cacheManager.clearCache = function (region, cacheKey) {
	if (cacheManager.hasCache(region, cacheKey)) {
		delete cacheManager.cache[region][cacheKey];
	}
}
