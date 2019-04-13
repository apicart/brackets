import {renderToString} from './renderToString';
import {getRenderingInstance, renderingInstancesStatuses} from './runtime/renderingInstances';
import {nonInitializedElementAttributeName} from '../shared/variables';


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
	renderingInstance._destroyChildrenInstances();

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

	renderingInstance._childrenInstancesIds = templateObject.templateRuntime.renderedComponents;
	renderingInstance._initChildrenInstances();
	renderingInstance._bindEventHandlers();

	targetElement.removeAttribute(nonInitializedElementAttributeName);
	renderingInstance.afterRender(targetElement);
	renderingInstance._setStatus(renderingInstancesStatuses.redrawingDone);
}
