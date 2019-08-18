import { Brackets, templateLiteral } from './shared/variables';
import { render } from './render';
import { renderToString } from './renderToString';
import { addMacro, getMacros } from './runtime/macros';
import {
	createRenderingInstanceObject,
	getRenderingInstance,
	getRenderingInstances,
	findRenderingInstances,
	findRenderingInstance
} from './renderingInstance';
import { addComponent, getComponent, getComponents } from './runtime/components';
import { addFilter, getFilter, getFilters } from './runtime/filters';
import { utils } from './shared/utils';
import { cacheManager } from './cacheManager';
import { renderTemplate } from './templateEngine/renderTemplate';

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

Brackets.findRenderingInstance = findRenderingInstance;
Brackets.getRenderingInstance = getRenderingInstance;

Brackets.findRenderingInstances = findRenderingInstances;
Brackets.getRenderingInstances = getRenderingInstances;

Brackets.render = render;
Brackets.renderTemplate = renderTemplate;

/**
 * @param {{}} parameters
 * @return {{}}
 */
Brackets.renderToString = function (parameters) {
	return renderToString(createRenderingInstanceObject(parameters));
};

Brackets.configure();

if (utils.isDefined(window) && ! utils.isDefined(window.Brackets)) {
	window.Brackets = Brackets;
} else if (utils.isObject(module) && utils.isObject(module.exports)) {
	module.exports = Brackets;
}
