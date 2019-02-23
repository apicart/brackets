import {Brackets, templateLiteral} from './shared/variables';
import {render} from './render/render';
import {renderToString} from './render/renderToString';
import {addMacro, getMacros} from './render/runtime/macros';
import {
	createRenderingInstanceObject,
	getRenderingInstance,
	getRenderingInstances, renderingInstancesStatuses
} from './render/runtime/renderingInstances';
import {addComponent, getComponents} from './render/runtime/components';
import {addFilter, getFilter, getFilters} from './render/runtime/filters';
import {utils} from "./shared/utils";
import {cacheManager} from "./render/cacheManager";

Brackets.utils = utils;
Brackets.cacheManager = cacheManager;
Brackets.templateLiteral = templateLiteral;

Brackets.addFilter = addFilter;
Brackets.getFilter = getFilter;
Brackets.getFilters = getFilters;

Brackets.addComponent = addComponent;
Brackets.getComponents = getComponents;

Brackets.addMacro = addMacro;
Brackets.getMacros = getMacros;

Brackets.getRenderingInstance = getRenderingInstance;
Brackets.getRenderingInstances = getRenderingInstances;
Brackets.renderingInstancesStatuses = renderingInstancesStatuses;

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
