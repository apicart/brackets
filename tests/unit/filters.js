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
