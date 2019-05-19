describe('Components', function () {
	var workspaceElement;

	beforeEach(function () {
		workspaceElement = getWorkspaceElement();
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
						this.data.number ++;
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

		Brackets
			.addComponent('shareButton2', {
				data: {
					number: 0
				},
				instanceId: 'shareButton2',
				resultCacheEnabled: true,
				cacheKey: 'shareButton2',
				methods: {
					updateNumber: function () {
						this.data.number ++;
					}
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

		appElement1.querySelector('button').click();
		appElement1.querySelector('button').click();
		appElement1.querySelector('button').click();

		assert.equal(appElement1.innerText, 'Article 1 => Share (0)');

		assert.equal(Brackets.findRenderingInstance('shareButton2').data.number, 3);
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
