module.exports = function(config) {
	config.set({
		frameworks: ['mocha', 'chai'],
		files: [
			'dist/brackets.js',
			'tests/stack-browser.js'
		],
		plugins: [
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
