import { renderToString } from './renderToString';

export function renderInstance(instance) {
	if ( ! instance.redrawingEnabled || ! instance.el) {
		return;
	}

	instance.destroyChildrenInstances();

	var
		templateObject = renderToString(instance),
		templateParentNode = new DOMParser().parseFromString(templateObject.templateString, 'text/html'),
		replacingElement = templateParentNode.body.firstChild,
		elementToBeReplaced = instance.el;

	instance.childrenInstancesIds = templateObject.templateRuntime.renderedComponents;
	instance.el = replacingElement;
	instance.mount();

	elementToBeReplaced.parentElement.replaceChild(replacingElement, elementToBeReplaced);
}
