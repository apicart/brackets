(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

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

	describe('Filters', function () {
		var workspaceElement;

		beforeEach(function () {
			workspaceElement = getWorkspaceElement();
		});

		it('Filter addition and test', function () {
			workspaceElement.innerHTML = '<div id="app">{{$text|firstToUpper}}</div>';

			Brackets
				.addFilter('firstToUpper', function (text) {
					return text.charAt(0).toUpperCase() + text.slice(1);
				})
				.render({
					resultCacheEnabled: true,
					el: '#app',
					data: {
						text: 'text'
					}
				});

			assert.equal(workspaceElement.querySelector('#app').innerText, 'Text');
		});
	});


	/**
	 * @returns {Element}
	 */
	function getWorkspaceElement()
	{
		var element = document.querySelector('body #workspace');

		if ( ! element) {
			element = document.querySelector('body');
		}

		return element;
	}

	describe('Components', function () {
		var workspaceElement;

		beforeEach(function () {
			workspaceElement = getWorkspaceElement$1();
		});

		it('Add components, multiple usage, data object must be unique for each component.', function () {
			workspaceElement.innerHTML = `
			<div class="app" id="app-1">{{component shareArticle, articleName: 'Article 1'}}</div>
			<div class="app" id="app-2">{{component shareArticle, articleName: 'Article 2'}}</div>
			<div class="app" id="app-3">{{component shareArticle, articleName: 'Article 3'}}</div>
		`;

			Brackets
				.addComponent('shareButton', {
					data: {
						number: 0
					},
					methods: {
						updateNumber: function () {
							this.number ++;
						}
					},
					template: '<button b-on="click updateNumber()">Share ({{$number}})</button>'
				})
				.addComponent('shareArticle', {
					template: '<div>{{$articleName}} => {{component shareButton}}</div>'
				})
				.render({
					el: '.app'
				});
			
			var
				appElement1 = workspaceElement.querySelector('#app-1'),
				appElement2 = workspaceElement.querySelector('#app-2'),
				appElement3 = workspaceElement.querySelector('#app-3');

			assert.equal(appElement1.innerText, 'Article 1 => Share (0)');
			assert.equal(appElement2.innerText, 'Article 2 => Share (0)');
			assert.equal(appElement3.innerText, 'Article 3 => Share (0)');

			// 1
			appElement1.querySelector('button').click();
			// 2
			appElement2.querySelector('button').click();
			appElement2.querySelector('button').click();
			// 3
			appElement3.querySelector('button').click();
			appElement3.querySelector('button').click();
			appElement3.querySelector('button').click();

			assert.equal(appElement1.innerText, 'Article 1 => Share (1)');
			assert.equal(appElement2.innerText, 'Article 2 => Share (2)');
			assert.equal(appElement3.innerText, 'Article 3 => Share (3)');

			// 1
			appElement1.querySelector('button').click();
			assert.equal(appElement1.innerText, 'Article 1 => Share (2)');
		});

		it('Add components, multiple usage, data object must be unique for each component, result cache.', function () {
			workspaceElement.innerHTML = `
			<div class="app" id="app-1">{{component shareArticle2, articleName: 'Article 1'}}</div>
		`;
			var renderingInstanceHash;

			Brackets
				.addComponent('shareButton2', {
					data: {
						number: 0
					},
					resultCacheEnabled: true,
					cacheKey: 'shareButtons2',
					methods: {
						updateNumber: function () {
							this.number ++;
						}
					},
					afterRender: function () {
						renderingInstanceHash = this._hash;
					},
					template: '<button b-on="click updateNumber()">Share ({{$number}})</button>'
				})
				.addComponent('shareArticle2', {
					template: '<div>{{$articleName}} => {{component shareButton2}}</div>'
				})
				.render({
					el: '.app'
				});

			var appElement1 = workspaceElement.querySelector('#app-1');

			assert.equal(appElement1.innerText, 'Article 1 => Share (0)');

			// 1
			appElement1.querySelector('button').click();
			appElement1.querySelector('button').click();

			assert.equal(appElement1.innerText, 'Article 1 => Share (0)');

			appElement1.querySelector('button').click();

			assert.equal(Brackets.getRenderingInstance(renderingInstanceHash).data.number, 3);
		});
	});


	/**
	 * @returns {Element}
	 */
	function getWorkspaceElement$1()
	{
		var element = document.querySelector('body #workspace');

		if ( ! element) {
			element = document.querySelector('body');
		}

		return element;
	}

	describe('Complex', function () {
		var workspaceElement;

		beforeEach(function () {
			workspaceElement = getWorkspaceElement$2();
		});

		it('Template from object, cache, text', function () {
			workspaceElement.innerHTML = '<div id="app"></div>';
			var renderingInstanceHash;

			Brackets.render({
				el: '#app',
				template: '{{$text}}',
				cacheKey: 'test',
				resultCacheEnabled: true,
				data: {
					text: "I love️ Brackets!"
				},
				afterRender: function () {
					renderingInstanceHash = this._hash;
				}
			});

			assert.equal(workspaceElement.innerText, 'I love️ Brackets!');
			assert.isTrue(typeof Brackets.cacheManager.getCache('templateFunctions', 'test') === 'function');
			assert.isTrue(typeof Brackets.cacheManager.getCache('templateResults', renderingInstanceHash) === 'object');
		});

		it('Template from element, cache, text', function () {
			workspaceElement.innerHTML = '<div id="app">{{$text}}</div>';

			Brackets.render({
				el: '#app',
				cacheKey: 'test',
				data: {
					text: "I love️ Brackets!"
				}
			});

			assert.equal(workspaceElement.innerText, 'I love️ Brackets!');
		});


		it('Select template according to version parameter.', function () {
			workspaceElement.innerHTML = `
			<div id="app"></div>
			<template id="templateA">{{$text}}-A</template>
			<template id="templateB">{{$text}}-B</template>
		`;
			Brackets.render({
				el: '#app',
				data: {
					version: 'a',
					text: "Template"
				},
				template: function () {
					return this.data.version === 'a' ? '#templateA' : '#templateB';
				}
			});

			var appText = workspaceElement.querySelector('#app').innerText;
			assert.equal(appText,  'Template-A');
		});


		it('After and before render methods.', function () {
			workspaceElement.innerHTML = '<div id="app">{{$number}}</div>';
			Brackets.render({
				el: '#app',
				data: {
					number: 1
				},
				beforeRender: function () {
					this.data.number += 1;
				},
				afterRender: function () {
					workspaceElement.querySelector(this.el).setAttribute('data-foo', 'bar');
				}
			});

			var appElement = workspaceElement.querySelector('#app');

			assert.equal(appElement.innerText, '2');
			assert.isTrue(appElement.hasAttribute('data-foo'));
		});

		it('Event handlers.', function () {
			workspaceElement.innerHTML = `
			<div class="app" id="app-1">
				<span>{{$firstNumber}}-{{$secondNumber}}</span>
				<button class="button-1" b-on="click increaseSecondNumber(2); click firstNumber ++">
					{{$firstButtonText}}
				</button>
				<button class="button-2" b-on="click secondButtonText = 'Clicked app 1!'">{{$secondButtonText}}</button>
			</div>
			<div class="app" id="app-2">
				<span>{{$firstNumber}}-{{$secondNumber}}</span>
				<button class="button-1" b-on="click increaseSecondNumber(3); click firstNumber += 2">
					{{$firstButtonText}}
				</button>
				<button class="button-2" b-on="click secondButtonText = 'Clicked app 2!'">{{$secondButtonText}}</button>
			</div>
		`;

			Brackets.render({
				instanceId: 'tu',
				el: '.app',
				data: {
					firstNumber: 0,
					secondNumber: 0,
					firstButtonText: 'Click me 1!',
					secondButtonText: 'Click me 2!'
				},
				methods: {
					increaseSecondNumber: function (event, data) {
						this.secondNumber += parseInt(data);
					}
				}
			});

			var
				appElement1 = workspaceElement.querySelector('#app-1'),
				appElement2 = workspaceElement.querySelector('#app-2');

			assert.equal(appElement1.querySelector('span').innerText, '0-0');
			assert.equal(appElement1.querySelector('.button-1').innerText, 'Click me 1!');
			assert.equal(appElement1.querySelector('.button-2').innerText, 'Click me 2!');

			assert.equal(appElement2.querySelector('span').innerText, '0-0');
			assert.equal(appElement2.querySelector('.button-1').innerText, 'Click me 1!');
			assert.equal(appElement2.querySelector('.button-2').innerText, 'Click me 2!');

			appElement1.querySelector('.button-1').click();
			appElement2.querySelector('.button-1').click();
			appElement2.querySelector('.button-2').click();

			assert.equal(appElement1.querySelector('span').innerText, '1-2');
			assert.equal(appElement2.querySelector('span').innerText, '2-3');
			assert.equal(appElement2.querySelector('.button-2').innerText, 'Clicked app 2!');
		});

	});


	/**
	 * @returns {Element}
	 */
	function getWorkspaceElement$2()
	{
		var element = document.querySelector('body #workspace');

		if ( ! element) {
			element = document.querySelector('body');
		}

		return element;
	}

}));
