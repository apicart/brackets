import { utils } from './shared/utils';
import { createRenderingInstanceObject } from './renderingInstance';


/**
 * @param {{}} parameters
 */
export function render(parameters) {
	var targetElements = utils.getElementsAsArray(parameters.el);

	if (targetElements.length > 1
		&& parameters.cacheKey
		&& ! parameters.template
	) {
		throw new Error(
			'Brackets: you must provide a single template for \''
			+ parameters.cacheKey + '\' cacheKey because multiple target elements were found.'
		);
	}

	if ( ! targetElements) {
		return;
	}

	var renderedInstances = [];

	utils.each(targetElements, function (key, targetElement) {
		renderedInstances.push(createRenderingInstanceObject(parameters, targetElement).render());
	});

	return renderedInstances;
}
