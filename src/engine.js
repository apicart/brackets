import { Brackets, templateLiteral } from './shared/variables';
import { render } from './render';
import { renderToString } from './renderToString';
import { addMacro, getMacros } from './runtime/macros';
import {
	createRenderingInstanceObject,
	getRenderingInstance,
	getRenderingInstances
} from './renderingInstance';
import { addComponent, getComponent, getComponents } from './runtime/components';
import { addFilter, getFilter, getFilters } from './runtime/filters';
import { utils } from './shared/utils';
import { cacheManager } from './cacheManager';

Brackets.utils = utils;
Brackets.cacheManager = cacheManager;
Brackets.templateLiteral = templateLiteral;

Brackets.addFilter = addFilter;
Brackets.getFilter = getFilter;
Brackets.getFilters = getFilters;

Brackets.addComponent = addComponent;
Brackets.getComponent = getComponent;
Brackets.getComponents = getComponents;

Brackets.addMacro = addMacro;
Brackets.getMacros = getMacros;

Brackets.getRenderingInstance = getRenderingInstance;
Brackets.getRenderingInstances = getRenderingInstances;

Brackets.render = render;

/**
 * @param {{}} parameters
 * @return {{}}
 */
Brackets.renderToString = function (parameters) {
	return renderToString(createRenderingInstanceObject(parameters));
};

Brackets.configure();

if (typeof window !== 'undefined' && typeof window.Brackets === 'undefined') {
	window.Brackets = Brackets;

} else if (typeof module === 'object' && typeof module.exports === 'object' ) {
	module.exports = Brackets;
}
