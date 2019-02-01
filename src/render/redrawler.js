import {renderToString} from './renderToString';
import {each} from '../shared/utils';
import {getRenderingInstance, renderingInstancesStatuses} from './runtime/renderingInstances';
import {bindEventHandlers} from './binders/bindEventHandlers';
import {nonInitializedElementAttributeName, selectorAttributeName} from '../shared/variables';


export function redrawInstance(instanceId) {
	var
		renderingInstance = getRenderingInstance(instanceId),
		targetElement = document.querySelector(renderingInstance.el);

	if ( ! targetElement) {
		return;
	}

	renderingInstance._setStatus(renderingInstancesStatuses.redrawing);

	each(targetElement.querySelectorAll('[' + selectorAttributeName + ']'), function (key, instanceElement) {
		var instanceId = instanceElement.getAttribute(selectorAttributeName);
		getRenderingInstance(instanceId)._destroy();
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

	each(templateObject.templateRuntime.renderedComponents, function (key, componentRenderingInstanceId) {
		var componentRenderingInstance = getRenderingInstance(componentRenderingInstanceId);

		bindEventHandlers(componentRenderingInstance);

		if (typeof componentRenderingInstance.afterRender === 'function') {
			componentRenderingInstance.afterRender.call(componentRenderingInstance, targetElement);
		}
	});

	bindEventHandlers(renderingInstance);
	targetElement.removeAttribute(nonInitializedElementAttributeName);
	renderingInstance.afterRender(targetElement);
	renderingInstance._setStatus(renderingInstancesStatuses.redrawingDone);
}
