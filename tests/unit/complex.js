describe('Complex', function () {
	var workspaceElement;

	beforeEach(function () {
		workspaceElement = getWorkspaceElement();
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
function getWorkspaceElement()
{
	var element = document.querySelector('body #workspace');

	if ( ! element) {
		element = document.querySelector('body');
	}

	return element;
}
