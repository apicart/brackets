import { Brackets } from '../shared/variables';
import { utils } from '../shared/utils';
import { createRenderingInstanceObject } from '../renderingInstances';


/**
 * @param {{}} parameters
 */
export function render(parameters) {
	var targetElements;

	if (typeof parameters.el === 'string') {
		targetElements = document.querySelectorAll(parameters.el);

	} else if (parameters.el instanceof Element) {
		targetElements = [parameters.el];

	} else if (parameters.el instanceof NodeList || Array.isArray(parameters.el)) {
		targetElements = parameters.el;

	} else {
		throw new Error('Brackets: unsupported type for parameter el.');
	}

	if (targetElements.length > 1 && parameters.cacheKey && ! parameters.template) {
		throw new Error(
			'Brackets: you must provide a single template for \''
			+ parameters.cacheKey + '\' cacheKey because multiple target elements were found.'
		);
	}

	if ( ! targetElements) {
		return;
	}

	utils.each(targetElements, function (key, targetElement) {
		createRenderingInstanceObject(parameters, targetElement).render();
	});

	return Brackets;
}
