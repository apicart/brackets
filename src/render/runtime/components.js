import {Brackets} from '../../shared/variables';
import {cloneObject, each} from '../../shared/utils';
import {createRenderingInstanceObject} from './renderingInstances';
import {renderToString} from '../renderToString';


var components = {
	register: {},
	renderToString: renderComponent
};


/**
 * @param {string} name
 * @param {{}} componentDataFromTemplate
 * @return {string}
 */
export function renderComponent(name, componentDataFromTemplate) {
	var componentRenderingInstance = getComponent(name);
	if (componentDataFromTemplate) {
		each(componentDataFromTemplate, function (key, value) {
			componentRenderingInstance.addData(key, value);
		});
	}

	componentRenderingInstance._parent = this.parentInstance;

	var
		templateObject = renderToString(componentRenderingInstance),
		renderedComponents =
			[componentRenderingInstance.instanceId].concat(templateObject.templateRuntime.renderedComponents);

	this.renderedComponents = this.renderedComponents.concat(renderedComponents);
	return templateObject.templateString;
}


/**
 * @param {string} name
 * @param {{}} parameters
 * @return {Brackets}
 */
export function addComponent(name, parameters) {
	if (getComponent(name, false)) {
		throw new Error('Brackets: Component "' + name +'" is already defined.');
	}

	parameters._type = 'component';
	components.register[name] = parameters;

	return Brackets;
}


/**
 * @param {string} name
 * @param {boolean|null} required
 * @return {{}}
 */
export function getComponent(name, required) {
	var componentExists = name in components.register;

	if ( ! componentExists) {
		if (required !== false) {
			throw new Error('Brackets: Component "' + name + '" not found.');
		}

		return null;
	}

	return createRenderingInstanceObject(cloneObject(components.register[name]));
}


export function getComponents() {
	return components;
}
