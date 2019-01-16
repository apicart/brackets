export var Brackets = {
	devMode: false
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
