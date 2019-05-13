import { Brackets } from '../shared/variables';
import { utils } from '../shared/utils';
import { createRenderingInstanceObject } from '../renderingInstances';


var components = {
	register: {}
};


/**
 * @param {string} name
 * @param {{}} parameters
 * @return {Brackets}
 */
export function addComponent(name, parameters) {
	if (getComponent(name, false)) {
		throw new Error('Brackets: Component "' + name +'" is already defined.');
	}

	parameters.type = 'component';
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
