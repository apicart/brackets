import { utils } from './utils';
import { initMacros } from '../runtime/macros';
import { initTemplateTokenizer } from '../templateEngine/tokenizeTemplate';

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
export var selectorAttributeName = 'b-instance';

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
