/* eslint-disable max-nested-callbacks, max-len, no-global-assign */

describe('Macros', function () {
	it('if, else, elseif', function () {
		var templateObject = Brackets.renderToString({
			data: {a: 1},
			template: '{{if a === 1}}{{$a}}{{/if}}'
		});
		assert.equal(templateObject.templateString, '1');

		templateObject = Brackets.renderToString({
			data: {a: 2},
			template: '{{if a === 1}}{{$a}}{{else}}two{{/if}}'
		});
		assert.equal(templateObject.templateString, 'two');

		templateObject = Brackets.renderToString({
			data: {a: 2},
			template: '{{if a === 1}}{{$a}}{{elseif a == 2}}two{{else}}nope{{/if}}'
		});
		assert.equal(templateObject.templateString, 'two');
	});


	it('for', function () {
		var templateObject = Brackets.renderToString({
			data: {a: 3},
			template: '{{for i = 0; i < a ; i++}}{{$i}}{{/for}}'
		});

		assert.equal(templateObject.templateString, '012');
	});


	it('foreach', function () {
		var templateObject = Brackets.renderToString({
			data: {numbers: {a: 3, b: 2, c: 1}},
			template: `
				{{foreach numbers as key,number}}
					{{if this.isFirst()}}First-{{/if}}
					{{if this.isOdd()}}
						odd-
					{{elseif this.isEven()}}
						even-
					{{/if}}
					{{$key}}-{{$number}}
					{{if ! this.isLast()}},{{/if}}
				{{/foreach}}
				`
		});

		assert.equal(templateObject.templateString.replace(/\s/g, ''), 'First-odd-a-3,even-b-2,odd-c-1');
	});


	it('while, breakIf, continueIf', function () {
		var templateObject = Brackets.renderToString({
			data: {i: 3},
			template: '{{while i--}}{{$i}}{{/while}}'
		});

		assert.equal(templateObject.templateString, '210');

		templateObject = Brackets.renderToString({
			data: {i: 3},
			template: '{{while i--}}{{continueIf i === 1}}{{$i}}{{/while}}'
		});

		assert.equal(templateObject.templateString, '20');

		templateObject = Brackets.renderToString({
			data: {i: 3},
			template: '{{while i--}}{{breakIf i === 0}}{{$i}}{{/while}}'
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

		Brackets.renderToString({
			data: {i: 3},
			template: '{{dump \'test\'}}'
		});
	});


	it('var', function () {
		var templateObject = Brackets.renderToString({
			template: '{{var a = 1}}{{$a}}'
		});

		assert.equal(templateObject.templateString, '1');
	});


	it('js', function () {
		var templateObject = Brackets.renderToString({
			template: '{{js var a = 2}}{{$a}}'
		});

		assert.equal(templateObject.templateString, '2');
	});

	it ('Add macro', function () {
		var templateObject = Brackets
			.addMacro('sayHello', '_template += \'Hello \#0\';')
			.renderToString({
				template: '{{sayHello World}}'
			});

		assert.equal(templateObject.templateString, 'Hello World');

		var templateObject = Brackets
			.addMacro('sayHelloFromFunction', function (text) {
				return '_template += \'Hello ' + text +'\';';
			})
			.renderToString({
				template: '{{sayHelloFromFunction World again!}}'
			});

		assert.equal(templateObject.templateString, 'Hello World again!');
	});
});
