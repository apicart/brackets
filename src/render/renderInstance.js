import { renderToString } from './renderToString';

export function renderInstance(instance) {
	if ( ! instance.redrawingEnabled || ! instance.el) {
		return;
	}

	instance.destroyChildrenInstances();

	var
		templateObject = renderToString(instance),
		templateParentNode = new DOMParser().parseFromString(templateObject.templateString, 'text/html'),
		templateParentNodeFirstChild = templateParentNode.body.firstChild,
		replacingElement = templateParentNodeFirstChild instanceof Element
			? templateParentNodeFirstChild
			: templateParentNode.body.innerHTML,
		elementToBeReplaced = instance.el;

	instance.childrenInstancesIds = templateObject.templateRuntime.renderedComponents;

	if (replacingElement instanceof Element) {
		instance.el = replacingElement;
		instance.mount();
		elementToBeReplaced.parentElement.replaceChild(replacingElement, elementToBeReplaced);

	} else {
		elementToBeReplaced.innerHTML = replacingElement;
	}
}
