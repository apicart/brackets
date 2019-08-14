import { utils } from './shared/utils';
import { createRenderingInstanceObject } from './renderingInstance';


/**
 * @param {{}} parameters
 */
export function render(parameters) {
	var targetElements = utils.getElementsAsArray(parameters.el);

	if ( ! targetElements) {
		return;
	}

	var renderedInstances = [];

	utils.each(targetElements, function (key, targetElement) {
		renderedInstances.push(createRenderingInstanceObject(parameters, targetElement).render());
	});

	return renderedInstances;
}
