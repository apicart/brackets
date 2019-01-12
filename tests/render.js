var templating = Brackets;

describe('Render', function () {
	it('templateObject', function () {
		var templateObject = templating.renderToString({template: 'Text'});
		assert.deepStrictEqual(Object.keys(templateObject), ['templateString', 'templateRuntime']);
	});
});
