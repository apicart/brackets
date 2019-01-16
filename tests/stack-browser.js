(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	var templating = Brackets;

	describe('Render', function () {
		it('templateObject', function () {
			var templateObject = templating.renderToString({template: 'Text'});
			assert.deepStrictEqual(Object.keys(templateObject), ['templateString', 'templateRuntime']);
		});
	});

	/* eslint-disable max-nested-callbacks, max-len, no-global-assign */

	var templating$1 = Brackets;

	describe('Macros', function () {
		it('if, else, elseif', function () {
			var templateObject = templating$1.renderToString({
				data: {a: 1},
				template: '{{if a === 1}}{{$a}}{{/if}}'
			});
			assert.equal(templateObject.templateString, '1');

			templateObject = templating$1.renderToString({
				data: {a: 2},
				template: '{{if a === 1}}{{$a}}{{else}}two{{/if}}'
			});
			assert.equal(templateObject.templateString, 'two');

			templateObject = templating$1.renderToString({
				data: {a: 2},
				template: '{{if a === 1}}{{$a}}{{elseif a == 2}}two{{else}}nope{{/if}}'
			});
			assert.equal(templateObject.templateString, 'two');
		});


		it('for', function () {
			var templateObject = templating$1.renderToString({
				data: {a: 3},
				template: '{{for i = 0; i < a ; i++}}{{$i}}{{/for}}'
			});

			assert.equal(templateObject.templateString, '012');
		});


		it('while, breakif, continueif', function () {
			var templateObject = templating$1.renderToString({
				data: {i: 3},
				template: '{{while i--}}{{$i}}{{/while}}'
			});

			assert.equal(templateObject.templateString, '210');

			templateObject = templating$1.renderToString({
				data: {i: 3},
				template: '{{while i--}}{{continueif i === 1}}{{$i}}{{/while}}'
			});

			assert.equal(templateObject.templateString, '20');

			templateObject = templating$1.renderToString({
				data: {i: 3},
				template: '{{while i--}}{{breakif i === 0}}{{$i}}{{/while}}'
			});

			assert.equal(templateObject.templateString, '21');
		});


		it('dump', function () {

			var _console = console;

			console = {
				log: function (parameter) {
					console = _console;
					assert.equal(parameter, 'test');
				}
			};

			templating$1.renderToString({
				data: {i: 3},
				template: '{{dump \'test\'}}'
			});
		});


		it('var', function () {
			var templateObject = templating$1.renderToString({
				template: '{{var a = 1}}{{$a}}'
			});

			assert.equal(templateObject.templateString, '1');
		});


		it('js', function () {
			var templateObject = templating$1.renderToString({
				template: '{{js var a = 2}}{{$a}}'
			});

			assert.equal(templateObject.templateString, '2');
		});

	});

}));
