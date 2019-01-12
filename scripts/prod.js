import banner from 'rollup-plugin-banner'

export default {
	input: 'src/core.js',
	output: {
		file: 'dist/brackets.js',
		format: 'umd',
		name: "Brackets"
	},
	plugins: [
		banner('brackets.js v<%= pkg.version %> \n(c) 2018-' + new Date().getFullYear() + ' <%= pkg.author %>\n Released under the MIT License.')
	]
};
