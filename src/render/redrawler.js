import {renderToString} from "./renderToString";
import {each} from "../shared/utils";
import {getRenderingInstance} from "./runtime/renderingInstances";
import {bindEventHandlers} from "./binders/bindEventHandlers";
import {nonInitializedElementAttributeName} from "../shared/variables";


export function redrawInstance(instanceId) {
	var
		renderingInstance = getRenderingInstance(instanceId),
		targetElement = document.querySelector(renderingInstance.el);
	renderingInstance.beforeRender.call(renderingInstance, targetElement);

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
	renderingInstance.afterRender.call(renderingInstance, targetElement);
}
