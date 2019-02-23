import {Brackets} from '../shared/variables';
import {each} from '../shared/utils';
import {redrawInstance} from './redrawler';
import {createRenderingInstanceObject} from './runtime/renderingInstances';


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

	each(targetElements, function (key, targetElement) {
		redrawInstance(createRenderingInstanceObject(parameters, targetElement).instanceId);
	});

	return Brackets;
}

