import {Brackets, selectorAttributeName} from '../../shared/variables';
import {cloneObject, each, generateHash} from '../../shared/utils';
import {createRenderingInstanceObject} from './renderingInstances';


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
			componentRenderingInstance.data[key] = value;
		});
	}

	componentRenderingInstance._parent = this.parentInstance;

	var
		templateObject = Brackets.renderToString(componentRenderingInstance),
		renderedComponents = [componentRenderingInstance.id].concat(templateObject.templateRuntime.renderedComponents);

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

	parameters._kind = 'component';
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
		if (required) {
			throw new Error('Brackets: Component "' + name + '" not found.');
		}

		return null;
	}

	var
		componentParameters = cloneObject(components.register[name]),
		renderingInstanceClone = createRenderingInstanceObject(componentParameters),
		hash = generateHash();

	renderingInstanceClone._hash = hash;
	renderingInstanceClone.el ='[' + selectorAttributeName + '="' + hash + '"]';
	return renderingInstanceClone;
}


export function getComponents() {
	return components;
}
