import {utils} from './utils';
import {initTemplateTokenizer} from '../render/compiler/tokenizeTemplate';
import {initMacros} from '../render/runtime/macros';

export var Brackets = {
	config: {
		devMode: false,
		delimiters: ['{{', '}}']
	},
	configure: function (configuration) {
		if (configuration) {
			this.config = utils.mergeObjects(this.config, configuration);
		}

		initTemplateTokenizer(this.config);
		initMacros(this.config);

		return this;
	}
};

export var eventHandlersAttributeName = 'b-on';
export var nonInitializedElementAttributeName = 'b-init';
export var selectorAttributeName = 'data-b-instance';

export var templateLiteralsEnabled = (function () {
	try {
		eval('`x`');
		return true;
	}
	catch (e) {
		return false;
	}
})();


export var templateLiteral = templateLiteralsEnabled ? '`' : '\'';
