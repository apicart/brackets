import {renderToString} from './renderToString';
import {utils} from '../shared/utils';
import {getRenderingInstance, renderingInstancesStatuses} from './runtime/renderingInstances';
import {bindEventHandlers} from './binders/bindEventHandlers';
import {nonInitializedElementAttributeName, selectorAttributeName} from '../shared/variables';


export function redrawInstance(instanceId) {
	var renderingInstance = getRenderingInstance(instanceId, false);

	if ( ! renderingInstance) {
		return;
	}

	var	targetElement = document.querySelector(renderingInstance.el);

	if ( ! targetElement) {
		return;
	}

	renderingInstance._setStatus(renderingInstancesStatuses.redrawing);

	utils.each(targetElement.querySelectorAll('[' + selectorAttributeName + ']'), function (key, instanceElement) {
		getRenderingInstance(instanceElement.getAttribute(selectorAttributeName))._destroy();
	});

	renderingInstance.beforeRender(targetElement);

	var
		templateObject = renderToString(renderingInstance),
		templateParentNode = new DOMParser()
			.parseFromString(templateObject.templateString, 'text/html')
			.querySelector(renderingInstance.el);

	if (templateParentNode) {
		templateObject.templateString = templateParentNode.innerHTML;
	}

	targetElement.innerHTML = templateObject.templateString;

	utils.each(templateObject.templateRuntime.renderedComponents, function (key, componentRenderingInstanceId) {
		var componentRenderingInstance = getRenderingInstance(componentRenderingInstanceId);
		bindEventHandlers(componentRenderingInstance);

		if (typeof componentRenderingInstance.afterRender === 'function') {
			componentRenderingInstance.afterRender.call(componentRenderingInstance, targetElement);
		}

		componentRenderingInstance._setStatus(renderingInstancesStatuses.redrawingDone);
	});

	bindEventHandlers(renderingInstance);
	targetElement.removeAttribute(nonInitializedElementAttributeName);
	renderingInstance.afterRender(targetElement);
	renderingInstance._setStatus(renderingInstancesStatuses.redrawingDone);
}
