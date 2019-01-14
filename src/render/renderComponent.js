import {Brackets, components} from "../shared/variables";
import {cloneObject, each, generateHash} from "../shared/utils";

/**
 * @param {string} componentName
 * @param {{}} componentDataFromTemplate
 * @return {string}
 */
export function renderComponent(componentName, componentDataFromTemplate) {
	var component = components.register[componentName];

	if (typeof component === 'undefined') {
		throw new Error('Brackets: Component "' + componentName + '" was not found.');
	}

	var
		componentHash = generateHash(),
		componentData = component.data ? cloneObject(component.data) : {};

	if (componentDataFromTemplate) {
		each(componentDataFromTemplate, function (key, value) {
			componentData[key] = value;
		});
	}

	var
		templateObject = Brackets.renderToString({
			beforeRender: component.beforeRender,
			cacheKey: componentName,
			componentHash: componentHash,
			data: componentData,
			template: component.template
		}),
		renderedComponents = [{
			componentHash: componentHash,
			data: componentData,
			componentName: componentName
		}].concat(templateObject.templateRuntime.renderedComponents);

	this.renderedComponents = this.renderedComponents.concat(renderedComponents);
	return templateObject.templateString;
}
