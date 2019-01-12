/** 
 * brackets.js v1.0.0 
 * (c) 2018-2019 Vladimír Macháček
 *  Released under the MIT License.
 */
(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	/**
	 * @param {{}} obj
	 * @return {{}}
	 */
	function cloneObject(obj) {
		var newObject = {};

		Object.keys(obj).forEach(function (key) {
			newObject[key] = obj && typeof obj === Object(obj) ? cloneObject(obj[key]) : obj[key];
		});

		return newObject;
	}


	/**
	 * @param {{}|[]} iterable
	 * @param {function} callback
	 */
	function each(iterable, callback) {
		var
			iterator,
			iterableLength,
			statement,
			keys,
			keysLength,
			key;

		if (Array.isArray(iterable)) {
			iterableLength = iterable.length;

			for (iterator = 0; iterator < iterableLength; iterator ++) {
				statement = callback(iterator, iterable[iterator]);

				if (statement === false) {
					break;
				}
			}

		} else {
			keys = Object.keys(iterable);
			keysLength = keys.length;

			for (iterator = 0; iterator < keysLength; iterator ++) {
				key = keys[iterator];
				statement = callback(key, iterable[key]);

				if (statement === false) {
					break;
				}
			}
		}
	}


	/**
	 * @param {number} length
	 * @returns {string}
	 */
	function generateHash(length) {
		length = length || 10;
		length += 2;
		return Math.random().toString(36).substring(2, length);
	}

	var Brackets = {
		devMode: false
	};
	var templateLiteralsEnabled = (function () {
		try {
			eval('`x`');
			return true;
		}
		catch (e) {
			return false;
		}
	})();
	var macrosRegularExpression;
	var templateLiteral = templateLiteralsEnabled ? '`' : '\'';
	var components = {
		register: {},
		renderToString: function (componentName, componentDataFromTemplate) {
			var component = components.register[componentName];

			if (typeof component === 'undefined') {
				throw new Error('Brackets: Component "' + componentName + '" was not found.');
			}

			var
				componentHash = generateHash(),
				componentData = component.data ? cloneObject(component.data) : {};

			if (componentDataFromTemplate) {
				each(componentDataFromTemplate, function (key, value) {
					componentData[key] = value;
				});
			}

			var
				templateObject = Brackets.renderToString({
					beforeRender: component.beforeRender,
					cacheKey: componentName,
					componentHash: componentHash,
					data: componentData,
					template: component.template
				}),
				renderedComponents = [{
					componentHash: componentHash,
					data: componentData,
					componentName: componentName
				}].concat(templateObject.templateRuntime.renderedComponents);

			this.renderedComponents = this.renderedComponents.concat(renderedComponents);

			return templateObject.templateString;
		}
	};
	var filters = {};
	var macros = {
		breakif: 'if (#0) break;',
		continueif: 'if (#0) continue;',
		component: function (parameters) {
			var
				parametersToArray = parameters[0].split(','),
				componentName = parametersToArray[0],
				componentData;

			parametersToArray.shift();
			componentData = '{' + parametersToArray.join(',') + '}';

			return '_template += _runtime.components.renderToString.call('
				+ '_runtime, \'' + componentName + '\', ' + componentData
			+ ');';
		},
		dump: 'console.log(#0);',
		else: '} else {',
		elseif: '} else if (#0) {',
		for: 'for (var #0) {',
		'/for': '}',
		if: 'if (#0) {',
		'/if': '}',
		js: '#0;',
		var: 'var #0;',
		while: 'while (#0) {',
		'/while': '}'
	};


	function generateMacrosRegularExpression() {
		macrosRegularExpression = new RegExp(
			/* eslint-disable-next-line no-useless-escape */
			'{{(?:(?:(' + Object.keys(macros).join('|').replace('/', '\/') + ')(?: (.*?))?)|(?:(\\$.*?)))}}'
		);
	}


	filters.escape = function (variable) {
		var entityMap = {
			'"': '&quot;',
			'&': '&amp;',
			'\'': '&#39;',
			'/': '&#x2F;',
			'<': '&lt;',
			'=': '&#x3D;',
			'>': '&gt;',
			'`': '&#x60;'
		};

		return String(variable).replace(/[&<>"'`=/]/g, function (token) {
			return entityMap[token];
		});
	};


	Brackets.addComponent = function (name, parameters) {
		components.register[name] = parameters;
		return Brackets;
	};


	/**
	 * @param {string} name
	 * @param {function} callback
	 */
	Brackets.addFilter = function (name, callback) {
		filters[name] = callback;
		return Brackets;
	};


	/**
	 * @param {string} name
	 * @param {string|function} replacement
	 */
	Brackets.addMacro = function (name, replacement) {
		macros[name] = replacement;
		generateMacrosRegularExpression();
		return Brackets;
	};


	generateMacrosRegularExpression();
	Brackets._filters = filters;
	Brackets.templateLiteral = templateLiteral;

	var selectorAttributeName = 'data-brackets-component';

	var
		tokenReplacement = '}}{{',
		textRegularExpression = /{{((?:.|\n)*?)}}/;

	/**
	 * @param {string} template
	 * @return {{macros: [], text: []}}
	 */
	function tokenizeTemplate(template) {
		var
			macroTokens = [],
			textTokens = [],
			token,
			tokenArray,
			tokenFullMatch;

		if (template) {
			/* eslint-disable-next-line no-cond-assign */
			while (token = macrosRegularExpression.exec(template)) {
				tokenArray = [];
				tokenFullMatch = token[0];
				token.shift();

				each(token, function (tokenPartKey, tokenPart) {
					if (isNaN(parseInt(tokenPartKey))) {
						return;
					}

					if (typeof tokenPart !== 'undefined') {
						tokenArray.push(tokenPart);
					}
				});

				macroTokens.push(tokenArray);
				template = template.replace(tokenFullMatch, tokenReplacement);
			}

			template = '{{' + template + '}}';

			/* eslint-disable-next-line no-cond-assign*/
			while (token = textRegularExpression.exec(template)) {
				textTokens.push(token[1]);
				template = template.replace(token[0], '');
			}
		}

		return {
			macros: macroTokens,
			text: textTokens
		};
	}

	/**
	 * @param {[]} tokenMatchArray
	 * @return {string}
	 */
	function processVariable(tokenMatchArray) {
		var
			applyEscapeFilter = true,
			filterArray,
			filterFunction,
			filterName,
			filterParameters = [],
			tokenFullMatch = tokenMatchArray[0],
			tokenFullMatchArray = tokenFullMatch.split('|'),
			variable = tokenFullMatchArray[0].replace('$', '');

		tokenFullMatchArray.shift();

		if (tokenFullMatchArray.length) {
			each(tokenFullMatchArray, function (key, filter) {
				filterArray = filter.split(':');
				filterName = filterArray[0];

				if (filterName === 'noescape') {
					applyEscapeFilter = false;
					return;
				}

				filterParameters = typeof filterArray[1] === 'string' ? filterArray[1].split(',') : [];
				filterParameters.unshift(variable);
				filterFunction = filters[filterName];

				if (typeof filterFunction === 'undefined') {
					throw 'Undefined filter: "' + filterName + '".';
				}

				variable = 'Brackets._filters.' + filterName + '(' + filterParameters.join(',') +')';
			});
		}

		if (applyEscapeFilter) {
			variable = 'Brackets._filters.escape(' + variable + ')';
		}

		return '_template += ' + variable + ';';
	}

	/**
	 * @param {[]} tokenMatchArray
	 * @return {string}
	 */
	function processMacro(tokenMatchArray) {
		var
			macroName = tokenMatchArray[0],
			parsedToken;

		tokenMatchArray.shift();

		if (typeof macros[macroName] === 'string') {
			parsedToken = macros[macroName];

			each(tokenMatchArray, function (tokenMatchPartKey, tokenMatchPart) {
				parsedToken = parsedToken.replace(new RegExp('#' + tokenMatchPartKey), tokenMatchPart);
			});

		} else {
			parsedToken = macros[macroName](tokenMatchArray);
		}

		return parsedToken;
	}

	var variableMatchRegularExpression = /^\$/;

	/**
	 * @param {{}} tokens
	 * @param {{}} data
	 * @return {Function}
	 */
	function compileTemplate(tokens, data) {
		data = data || {};

		var
			macroTokenArray,
			macroTokenFirstPart,
			templateString = 'var _template = \'\';';

		each(tokens.text, function (tokenKey, tokenText) {
			templateString += '_template += ' + templateLiteral + tokenText + templateLiteral + ';';

			if (tokenKey in tokens.macros) {
				macroTokenArray = tokens.macros[tokenKey];
				macroTokenFirstPart = macroTokenArray[0];

				if (macroTokenFirstPart.match(variableMatchRegularExpression)) {
					templateString += processVariable(macroTokenArray);

				} else if (macroTokenFirstPart in macros) {
					templateString += processMacro(macroTokenArray);

				} else {
					throw 'Unknown token: "' + macroTokenFirstPart + '"';
				}
			}
		});

		templateString += 'return _template;';

		return new Function(Object.keys(data).join(','), templateString);
	}

	var templatesCache = {};

	/**
	 * @param {{}} parameters
	 * @return {*}
	 */
	function renderToString(parameters) {
		if (typeof parameters.beforeRender === 'function') {
			parameters.beforeRender.call(parameters);
		}

		var
			cacheKey = parameters.cacheKey || null,
			cacheKeyIsSet = typeof cacheKey === 'string',
			compiledTemplate,
			data = parameters.data ? cloneObject(parameters.data) : {},
			template = parameters.template || null,
			templateArguments = [];

		data['_runtime'] = {
			components: components,
			renderedComponents: []
		};

		if (cacheKeyIsSet && cacheKey in templatesCache) {
			compiledTemplate = templatesCache[cacheKey];

		} else {
			if ( ! templateLiteralsEnabled) {
				template = template.replace(/(?:\r\n|\r|\n)/g, ' ');
				template = template.replace(/'/g, '\'');
			}

			var tokens = tokenizeTemplate(template);
			compiledTemplate = compileTemplate(tokens, data);

			if (cacheKeyIsSet && ! (cacheKey in templatesCache)) {
				templatesCache[cacheKey] = compiledTemplate;
			}
		}

		if (data) {
			each(data, function (key, value) {
				templateArguments.push(value);
			});
		}

		var templateString = compiledTemplate.apply(null, templateArguments);

		if (parameters.componentHash) {
			templateString = templateString.replace('b-on=', 'b-on-' + parameters.componentHash + '=');
			var parentElement = new DOMParser().parseFromString(templateString, 'text/html').querySelector('body *');

			if (parentElement) {
				parentElement.setAttribute(selectorAttributeName, parameters.componentHash);
				templateString = parentElement.outerHTML;
			}
		}

		return {
			templateString: templateString,
			templateRuntime: data['_runtime']
		};
	}

	var eventHandlerAttributeName = 'b-on';

	/**
	 * @param {Element} element
	 * @param {{}} parameters
	 * @return {Element}
	 */
	function attachEventHandlers(element, parameters) {
		var
			eventHandlersAttributeSuffix = parameters.componentHash ? '-' + parameters.componentHash : '',
			eventHandlersAttributeName = eventHandlerAttributeName + eventHandlersAttributeSuffix,
			eventHandlersSelector = '[' + eventHandlersAttributeName + ']',
			eventHandlers = element.querySelectorAll(eventHandlersSelector);

		each(eventHandlers, function (key, eventHandler) {
			var events = eventHandler.getAttribute(eventHandlersAttributeName).split(';');

			each(events, function (key, event) {
				(function (eventHandler, event) {
					event = event.trim();

					var
						eventName = event.match(/^(\S+)/)[1],
						eventFunction,
						eventArguments = [];

					event = event.replace(eventName + ' ', '');

					var methodMatch = event.match(/\S+\(.*\)$/);

					if (methodMatch) {
						var
							methodMatches = event.match(/^([^(]+)\((.*)\)/),
							methodName = methodMatches[1],
							methodArguments = methodMatches[2];

						if (typeof parameters.methods === 'undefined'
							|| typeof parameters.methods[methodName] === 'undefined'
						) {
							throw new Error('Brackets: Method "' + methodName + '" is not defined.');
						}

						eventFunction = parameters.methods[methodName];
						eventArguments = [methodArguments];

					} else {
						eventFunction = new Function('data', 'this.' + event + '; return this;');
					}

					eventHandler.addEventListener(eventName, function (event) {
						var redraw = eventFunction.apply(parameters.data, [event].concat(eventArguments)) || true;

						if ( ! redraw) {
							return false;
						}

						Brackets.render(parameters);
					});
				})(eventHandler, event);
			});

			if ( ! Brackets.devMode) {
				eventHandler.removeAttribute(eventHandlersAttributeName);
			}
		});
	}

	var nonInitializedElementAttributeName = 'b-init';

	/**
	 * @param {{}} parameters
	 */
	function render(parameters) {
		parameters.data = parameters.data ? cloneObject(parameters.data) : {};
		parameters.methods = parameters.methods || {};
		parameters.beforeRender = parameters.beforeRender || function () {};
		parameters.afterRender = parameters.afterRender || function () {};

		var targetElements;

		if (typeof parameters.el === 'string') {
			targetElements = document.querySelectorAll(parameters.el);

		} else if (parameters.el instanceof Element) {
			targetElements = [parameters.el];

		} else if (parameters.el instanceof NodeList || Array.isArray(parameters.el)) {
			targetElements = parameters.el;

		} else {
			throw new Error('Brackets: unsupported type for parameter el.');
		}

		if ( ! targetElements) {
			return;
		}

		each(targetElements, function (key, targetElement) {
			var
				hash = targetElement.getAttribute(selectorAttributeName),
				parametersCopy = hash ? parameters : cloneObject(parameters);

			if ( ! hash) {
				hash = generateHash();
				targetElement.setAttribute(selectorAttributeName, hash);
				parametersCopy.el = '[' + selectorAttributeName + '="' + hash +'"]';
				parametersCopy.hash = hash;
			}

			if ( ! parametersCopy.template) {
				parametersCopy.template = targetElement.innerHTML;

			} else if (parametersCopy.template && parametersCopy.template.match(/^#\S+/)) {
				var templateElement = document.querySelector(parametersCopy.template);

				if (templateElement) {
					parametersCopy.template = templateElement.innerHTML;
				}
			}

			parametersCopy.beforeRender.call(parametersCopy, targetElement);

			var
				templateObject = renderToString({
					componentHash: parametersCopy.componentHash || null,
					cacheKey: parametersCopy.cacheKey,
					data: parametersCopy.data,
					template: parametersCopy.template
				}),
				templateParentNode = new DOMParser()
					.parseFromString(templateObject.templateString, 'text/html')
					.querySelector(parametersCopy.el);

			if (templateParentNode) {
				templateObject.templateString = templateParentNode.innerHTML;
			}

			targetElement.innerHTML = templateObject.templateString;

			each(templateObject.templateRuntime.renderedComponents, function (key, componentParameters) {
				componentParameters.el = '[' + selectorAttributeName +'="' + componentParameters.componentHash + '"]';
				componentParameters.template = components.register[componentParameters.componentName].template;
				componentParameters.methods = components.register[componentParameters.componentName].methods;
				componentParameters.afterRender = components.register[componentParameters.componentName].afterRender;
				componentParameters.beforeRender = components.register[componentParameters.componentName].beforeRender;

				attachEventHandlers(targetElement, componentParameters);

				if (typeof componentParameters.afterRender === 'function') {
					componentParameters.afterRender.call(componentParameters, targetElement);
				}
			});

			attachEventHandlers(targetElement, parametersCopy);
			targetElement.removeAttribute(nonInitializedElementAttributeName);
			parametersCopy.afterRender.call(parametersCopy, targetElement);
		});
	}

	Brackets.render = render;
	Brackets.renderToString = renderToString;

	if (typeof window !== 'undefined' && typeof window.Brackets === 'undefined') {
		window.Brackets = Brackets;

	} else if (typeof module === 'object' && typeof module.exports === 'object' ) {
		module.exports = Brackets;
	}

}));
