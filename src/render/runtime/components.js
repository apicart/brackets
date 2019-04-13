import {Brackets} from '../../shared/variables';
import {utils} from '../../shared/utils';
import {createRenderingInstanceObject, renderingInstancesStatuses} from './renderingInstances';
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
		utils.each(componentDataFromTemplate, function (key, value) {
			componentRenderingInstance.addData(key, value);
		});
	}

	componentRenderingInstance._setStatus(renderingInstancesStatuses.redrawing);
	componentRenderingInstance.beforeRender();
	componentRenderingInstance._parentInstanceId = this.parentInstance.instanceId;

	var templateObject = renderToString(componentRenderingInstance);
	componentRenderingInstance._childrenInstancesIds = templateObject.templateRuntime.renderedComponents;

	// this = _runtime variable in template rendering process
	this.renderedComponents = this.renderedComponents.concat([componentRenderingInstance.instanceId]);
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

	return createRenderingInstanceObject(utils.cloneObject(components.register[name]));
}


export function getComponents() {
	return components;
}
