module.exports = function(config) {
	config.set({
		frameworks: ['mocha', 'chai'],
		files: [
			'www/dist/brackets.js',
			'www/tests/stack.js'
		],
		plugins: [
			'karma-firefox-launcher',
			'karma-chrome-launcher',
			'karma-chai',
			'karma-mocha'
		],
		browsers: ['ChromeHeadless'],
		reporters: ['progress'],
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: false,
		concurrency: Infinity
	})
};
