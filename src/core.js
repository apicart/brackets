import {Brackets} from './shared/variables';
import {render} from './render/render';
import {renderToString} from './render/renderToString';

Brackets.render = render;
Brackets.renderToString = renderToString;

if (typeof window !== 'undefined' && typeof window.Brackets === 'undefined') {
	window.Brackets = Brackets;

} else if (typeof module === 'object' && typeof module.exports === 'object' ) {
	module.exports = Brackets;
}
