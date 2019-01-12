import {components} from '../shared/variables';
import {selectorAttributeName} from './shared/variables';
import {cloneObject, each, generateHash} from '../shared/utils';
import {renderToString} from './renderToString';
import {attachEventHandlers} from './attachEventHandlers';

var nonInitializedElementAttributeName = 'b-init';

/**
 * @param {{}} parameters
 */
export function render(parameters) {
	parameters.data = parameters.data ? cloneObject(parameters.data) : {};
	parameters.methods = parameters.methods || {};
	parameters.beforeRender = parameters.beforeRender || function () {};
	parameters.afterRender = parameters.afterRender || function () {};

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

	if ( ! targetElements) {
		return;
	}

	each(targetElements, function (key, targetElement) {
		var
			hash = targetElement.getAttribute(selectorAttributeName),
			parametersCopy = hash ? parameters : cloneObject(parameters);

		if ( ! hash) {
			hash = generateHash();
			targetElement.setAttribute(selectorAttributeName, hash);
			parametersCopy.el = '[' + selectorAttributeName + '="' + hash +'"]';
			parametersCopy.hash = hash;
		}

		if ( ! parametersCopy.template) {
			parametersCopy.template = targetElement.innerHTML;

		} else if (parametersCopy.template && parametersCopy.template.match(/^#\S+/)) {
			var templateElement = document.querySelector(parametersCopy.template);

			if (templateElement) {
				parametersCopy.template = templateElement.innerHTML;
			}
		}

		parametersCopy.beforeRender.call(parametersCopy, targetElement);

		var
			templateObject = renderToString({
				componentHash: parametersCopy.componentHash || null,
				cacheKey: parametersCopy.cacheKey,
				data: parametersCopy.data,
				template: parametersCopy.template
			}),
			templateParentNode = new DOMParser()
				.parseFromString(templateObject.templateString, 'text/html')
				.querySelector(parametersCopy.el);

		if (templateParentNode) {
			templateObject.templateString = templateParentNode.innerHTML;
		}

		targetElement.innerHTML = templateObject.templateString;

		each(templateObject.templateRuntime.renderedComponents, function (key, componentParameters) {
			componentParameters.el = '[' + selectorAttributeName +'="' + componentParameters.componentHash + '"]';
			componentParameters.template = components.register[componentParameters.componentName].template;
			componentParameters.methods = components.register[componentParameters.componentName].methods;
			componentParameters.afterRender = components.register[componentParameters.componentName].afterRender;
			componentParameters.beforeRender = components.register[componentParameters.componentName].beforeRender;

			attachEventHandlers(targetElement, componentParameters);

			if (typeof componentParameters.afterRender === 'function') {
				componentParameters.afterRender.call(componentParameters, targetElement);
			}
		});

		attachEventHandlers(targetElement, parametersCopy);
		targetElement.removeAttribute(nonInitializedElementAttributeName);
		parametersCopy.afterRender.call(parametersCopy, targetElement);
	});
}
