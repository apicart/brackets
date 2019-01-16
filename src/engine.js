import {render} from './render/render';
import {renderToString} from './render/renderToString';
import {addMacro, getMacros} from "./render/runtime/macros";
import {getRenderingInstance, getRenderingInstances} from "./render/runtime/renderingInstances";
import {addComponent, getComponents} from "./render/runtime/components";
import {Brackets, templateLiteral} from "./shared/variables";
import {addFilter, getFilter, getFilters} from "./render/runtime/filters";


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

Brackets.render = render;
Brackets.renderToString = renderToString;


if (typeof window !== 'undefined' && typeof window.Brackets === 'undefined') {
	window.Brackets = Brackets;

} else if (typeof module === 'object' && typeof module.exports === 'object' ) {
	module.exports = Brackets;
}
