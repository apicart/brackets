/** 
 * brackets.js v1.0.0-alpha2 
 * (c) 2018-2019 Vladimír Macháček
 *  Released under the MIT License.
 */
(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	var utils = {};


	/**
	 * @param {{}} obj
	 * @return {{}}
	 */
	utils.cloneObject = function (obj) {
		var newObject = {};

		Object.keys(obj).forEach(function (key) {
			newObject[key] = obj && typeof obj === Object(obj) ? utils.cloneObject(obj[key]) : obj[key];
		});

		return newObject;
	};


	/**
	 * @returns {{}}
	 */
	utils.mergeObjects = function () {
		var
			newObject = {},
			iterable = Array.prototype.slice.call(arguments);

		utils.each(iterable, function (objectKey, object) {
			utils.each(object, function (key, value) {
				newObject[key] = ! (key in newObject) || ! utils.isObject(value)
					? value
					: utils.mergeObjects(newObject[key], value);
			});
		});

		return newObject;
	};


	/**
	 * @param {*} data
	 * @returns {boolean}
	 */
	utils.isObject = function (data) {
		if (typeof data === 'undefined' || data === null || Array.isArray(data)) {
			return false;
		}

		return typeof data === 'object';
	};


	/**
	 * @param {{}|[]} iterable
	 * @param {function} callback
	 */
	utils.each = function (iterable, callback) {
		var
			iterator,
			iteratorObject = {
				iterableLength: 0,
				counter: 0,
				isEven: function () {
					return this.counter % 2 === 0;
				},
				isOdd: function () {
					return Math.abs(this.counter % 2) === 1;
				},
				isFirst: function () {
					return this.counter === 1;
				},
				isLast: function () {
					return this.counter === this.iterableLength;
				}
			},
			iterableLength,
			statement,
			keys,
			keysLength,
			key;

		if (['undefined', 'number'].indexOf(typeof iterable) > -1 || iterable === null) {
			return;
		}

		if (Array.isArray(iterable)) {
			iterableLength = Object.keys(iterable).length;

			if ( ! iterableLength) {
				return;
			}

			iteratorObject.iterableLength = iterableLength;
			for (iterator = 0; iterator < iterableLength; iterator ++) {
				iteratorObject.counter ++;
				statement = callback.apply(iteratorObject, [iterator, iterable[iterator]]);

				if (statement === false) {
					break;
				}
			}

		} else {
			keys = Object.keys(iterable);
			keysLength = keys.length;

			if ( ! keys.length) {
				return;

			}

			iteratorObject.iterableLength = keysLength;
			for (iterator = 0; iterator < keysLength; iterator ++) {
				iteratorObject.counter ++;
				key = keys[iterator];
				statement = callback.apply(iteratorObject, [key, iterable[key]]);

				if (statement === false) {
					break;
				}
			}
		}
	};


	/**
	 * @param {number} length
	 * @returns {string}
	 */
	utils.generateHash = function (length) {
		length = length || 10;
		length += 2;
		return Math.random().toString(36).substring(2, length);
	};

	var
		macros = {
			break: 'break;',
			breakIf: 'if (#0) break;',
			continue: 'continue;',
			continueIf: 'if (#0) continue;',
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
			foreach: function (parameters) {
				parameters = parameters[0].split('as');

				var callbackFunctionParameters = parameters[1].trim();

				if (parameters[1].split(',').length === 1) {
					callbackFunctionParameters = 'key, ' + callbackFunctionParameters;
				}

				return '_runtime.utils.each(' + parameters[0].trim() + ', function (' + callbackFunctionParameters + ') {';
			},
			'/foreach': '});',
			if: 'if (#0) {',
			'/if': '}',
			js: '#0;',
			returnFalseIf: 'if (#0) return false;',
			returnIf: 'if (#0) return;',
			var: 'var #0;',
			while: 'while (#0) {',
			'/while': '}'
		},
		openingDelimiter,
		closingDelimiter;

	var macrosRegularExpression;


	/**
	 * @param {string} name
	 * @param {string|function} replacement
	 */
	function addMacro(name, replacement) {
		if (name in macros) {
			throw new Error('Brackets: Macro "' + name +'" is already defined.');
		}

		macros[name] = replacement;
		generateMacrosRegularExpression();

		return Brackets;
	}


	/**
	 * @return {{}}
	 */
	function getMacros() {
		return macros;
	}


	function generateMacrosRegularExpression() {
		// First part matches macros, second part after | matches variables
		macrosRegularExpression = new RegExp(
			openingDelimiter
				/* eslint-disable-next-line no-useless-escape */
				+ ' *(?:(?:(' + Object.keys(macros).join('|').replace('/', '\/') + ')(?: (.*?))?) *| *(?:(\\$.*?))) *'
			+ closingDelimiter
		);
	}


	function initMacros(config) {
		openingDelimiter = config.delimiters[0];
		closingDelimiter = config.delimiters[1];
		generateMacrosRegularExpression();
	}

	var
		openingDelimiter$1,
		closingDelimiter$1,

		tokenReplacement,
		textRegularExpression;

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

				utils.each(token, function (tokenPartKey, tokenPart) {
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

			template = openingDelimiter$1 + template + closingDelimiter$1;

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
	 * @param {{}} config
	 */
	function initTemplateTokenizer(config) {
		openingDelimiter$1 = config.delimiters[0];
		closingDelimiter$1 = config.delimiters[1];
		textRegularExpression = new RegExp(openingDelimiter$1 + '((?:.|\n)*?)' + closingDelimiter$1);
		tokenReplacement = closingDelimiter$1 + openingDelimiter$1;
	}

	var Brackets = {
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

	var eventHandlersAttributeName = 'b-on';
	var nonInitializedElementAttributeName = 'b-init';
	var selectorAttributeName = 'data-b-instance';

	var templateLiteralsEnabled = (function () {
		try {
			eval('`x`');
			return true;
		}
		catch (e) {
			return false;
		}
	})();


	var templateLiteral = templateLiteralsEnabled ? '`' : '\'';

	/**
	 * @param {[]} tokenMatchArray
	 * @return {string}
	 */
	function processVariable(tokenMatchArray) {
		var
			applyEscapeFilter = true,
			filterArray,
			filterName,
			filterParameters = [],
			tokenFullMatch = tokenMatchArray[0],
			tokenFullMatchArray = tokenFullMatch.split('|'),
			variable = tokenFullMatchArray[0].replace('$', '');

		tokenFullMatchArray.shift();

		if (tokenFullMatchArray.length) {
			utils.each(tokenFullMatchArray, function (key, filter) {
				filterArray = filter.split(':');
				filterName = filterArray[0] || null;

				if (filterName === 'noescape') {
					applyEscapeFilter = false;
					return;
				}

				filterParameters = typeof filterArray[1] === 'string' ? filterArray[1].split(',') : [];
				filterParameters.unshift(variable);

				variable = '_templateAdd([' + filterParameters + '], \'' + filterName + '\')';
			});
		}

		if (applyEscapeFilter) {
			variable = '_templateAdd(' + variable + ')';
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
			macros = getMacros(),
			parsedToken;

		tokenMatchArray.shift();

		if (typeof macros[macroName] === 'string') {
			parsedToken = macros[macroName];

			utils.each(tokenMatchArray, function (tokenMatchPartKey, tokenMatchPart) {
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
	 * @param {{}} templateParametersNames
	 * @return {Function}
	 */
	function compileTemplate(tokens, templateParametersNames) {
		var
			macroTokenArray,
			macroTokenFirstPart,
			templateString = 'var _template = \'\';' + _templateAdd.toString() + ';';

		utils.each(tokens.text, function (tokenKey, tokenText) {
			templateString += '_template += _templateAdd(' + templateLiteral + tokenText + templateLiteral + ');';

			if (tokenKey in tokens.macros) {
				macroTokenArray = tokens.macros[tokenKey];
				macroTokenFirstPart = macroTokenArray[0];

				if (macroTokenFirstPart.match(variableMatchRegularExpression)) {
					templateString += processVariable(macroTokenArray);

				} else if (macroTokenFirstPart in getMacros()) {
					templateString += processMacro(macroTokenArray);

				} else {
					throw 'Unknown token: "' + macroTokenFirstPart + '"';
				}
			}
		});

		templateString += 'return _template;';

		return new Function(templateParametersNames.join(','), templateString);
	}


	/**
	 * _runtime is provided in the template
	 * @param {*} data
	 * @param {string} filter
	 * @return {*}
	 * @private
	 */
	function _templateAdd(data, filter) {
		/* eslint-disable-next-line no-undef */
		return _runtime.templateAdd(data, filter);
	}

	var filters = {};


	/**
	 * @param {string} name
	 * @param {function} callback
	 */
	function addFilter(name, callback) {
		if (getFilter(name, false)) {
			throw new Error('Brackets: Filter "' + name +'" is already defined.');
		}

		filters[name] = callback;
		return Brackets;
	}


	/**
	 * @param {string} name
	 * @param {boolean|null} required
	 * @return {function|null}
	 */
	function getFilter(name, required) {
		if (required !== false && ! (name in filters)) {
			throw new Error('Brackets: Filter "' + name + '" not found.');
		}

		return filters[name] || null;
	}


	/**
	 * @return {{}}
	 */
	function getFilters() {
		return filters;
	}


	addFilter('escape', function (variable) {
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
	});

	/**
	 * @param {{}} renderingInstance
	 */
	function bindPropertyDescriptors(renderingInstance) {
		utils.each(renderingInstance.data, function (propertyKey, propertyValue) {
			if (propertyKey in renderingInstance._data) {
				return;
			}

			renderingInstance._data[propertyKey] = propertyValue;

			Object.defineProperty(renderingInstance.data, propertyKey, {
				get: function () {
					return renderingInstance._data[propertyKey];
				},
				set: function (value) {
					renderingInstance._data[propertyKey] = value;

					if (renderingInstance._redrawingEnabled) {
						redrawInstance(renderingInstance.instanceId);
					}
				}
			});
		});
	}

	var renderingInstances = {};
	var renderingInstancesStatuses = {
		bindingEventHandlers: 'bindingEventHandlers',
		create: 'create',
		destroy: 'destroy',
		pending: 'pending',
		redrawing: 'redrawing',
		renderingToString: 'renderingToString',
		renderingToStringDone: 'renderToStringDone',
		redrawingDone: 'redrawingDone'
	};

	function getRenderingInstances(type) {
		if ( ! type) {
			return renderingInstances;
		}

		var selectedInstances = {};

		utils.each(renderingInstances, function (id, instance) {
			if (instance._type === type) {
				selectedInstances[id] = instance;
			}
		});

		return selectedInstances;
	}


	/**
	 * @param {string} id
	 * @param {boolean|null} required
	 * @return {*}
	 */
	function getRenderingInstance(id, required) {
		if (required !== false && ! (id in renderingInstances)) {
			throw new Error('Brackets: Rendering instance "' + id +'" not found.');
		}

		return renderingInstances[id] || null;
	}


	/**
	 * @param {{}} parameters
	 * @param {Element|null} targetElement
	 * @return {{}}
	 */
	function createRenderingInstanceObject(parameters, targetElement) {
		parameters = utils.cloneObject(parameters);

		if (typeof parameters.template === 'function') {
			parameters.template = parameters.template.call(parameters);
		}

		var
			instance = {
				afterRender: function (targetElement) {
					if ( ! parameters.afterRender) {
						return;
					}

					this._redrawingEnabled = false;
					parameters.afterRender.call(this, targetElement);
					this._redrawingEnabled = true;
				},
				beforeRender: function (targetElement) {
					if ( ! parameters.beforeRender) {
						return;
					}

					this._redrawingEnabled = false;
					parameters.beforeRender.call(this, targetElement);
					this._redrawingEnabled = true;
				},
				cacheKey: parameters.cacheKey || null,
				data: parameters.data ? utils.cloneObject(parameters.data) : {},
				methods: parameters.methods || {},
				onStatusChange: parameters.onStatusChange || function () {},
				resultCacheEnabled: parameters.resultCacheEnabled || false,
				template: parameters.template,
				addData: function (property, value) {
					this.data[property] = value;
					bindPropertyDescriptors(this);
				},
				_create: function () {
					this._setStatus(renderingInstancesStatuses.create);
					renderingInstances[this.instanceId] = this;
					return this;
				},
				_data: {},
				_destroy: function () {
					this._setStatus(renderingInstancesStatuses.destroy);
					delete renderingInstances[this.instanceId];
				},
				_hash: utils.generateHash(),
				_type: parameters._type || 'view',
				_parent: null,
				_redrawingEnabled: true,
				_status: renderingInstancesStatuses.pending,
				_setStatus: function (status) {
					if (this._status === status) {
						return;
					}

					this._status = status;
					this.onStatusChange.call(this, status);
				},
				set instanceId(id) {
					this._instanceId = id;
				},
				get instanceId() {
					return this._instanceId ? this._instanceId + '-' + this._hash : this._hash;
				},
				get el() {
					return '[' + selectorAttributeName + '="' + this.instanceId +'"]';
				}
			};

		instance.instanceId = parameters.instanceId || null;
		if (targetElement && ! targetElement.getAttribute(selectorAttributeName)) {
			targetElement.setAttribute(selectorAttributeName, instance.instanceId);
		}

		if ( ! parameters.template && targetElement) {
			instance.template = targetElement.innerHTML;

		} else if (parameters.template && parameters.template.match(/^#\S+/)) {
			var templateElement = document.querySelector(parameters.template);

			if (templateElement) {
				instance.template = templateElement.innerHTML;
			}

		} else if ( ! parameters.template && ! targetElement) {
			throw new Error('Brackets: No template or target element provided for rendering.');
		}

		bindPropertyDescriptors(instance);

		if (getRenderingInstance(instance.instanceId, false)) {
			throw new Error('Brackets: Rendering instance "' + instance.instanceId +'" is already defined.');
		}

		return instance._create();
	}

	var components = {
		register: {},
		renderToString: renderComponent
	};


	/**
	 * @param {string} name
	 * @param {{}} componentDataFromTemplate
	 * @return {string}
	 */
	function renderComponent(name, componentDataFromTemplate) {
		var componentRenderingInstance = getComponent(name);
		if (componentDataFromTemplate) {
			utils.each(componentDataFromTemplate, function (key, value) {
				componentRenderingInstance.addData(key, value);
			});
		}

		componentRenderingInstance._setStatus(renderingInstancesStatuses.redrawing);
		componentRenderingInstance.beforeRender();
		componentRenderingInstance._parent = this.parentInstance;

		var
			templateObject = renderToString(componentRenderingInstance),
			renderedComponents =
				[componentRenderingInstance.instanceId].concat(templateObject.templateRuntime.renderedComponents);

		this.renderedComponents = this.renderedComponents.concat(renderedComponents);
		return templateObject.templateString;
	}


	/**
	 * @param {string} name
	 * @param {{}} parameters
	 * @return {Brackets}
	 */
	function addComponent(name, parameters) {
		if (getComponent(name, false)) {
			throw new Error('Brackets: Component "' + name +'" is already defined.');
		}

		parameters._type = 'component';
		components.register[name] = parameters;

		return Brackets;
	}


	/**
	 * @param {string} name
	 * @param {boolean|null} required
	 * @return {{}}
	 */
	function getComponent(name, required) {
		var componentExists = name in components.register;

		if ( ! componentExists) {
			if (required !== false) {
				throw new Error('Brackets: Component "' + name + '" not found.');
			}

			return null;
		}

		return createRenderingInstanceObject(utils.cloneObject(components.register[name]));
	}


	function getComponents() {
		return components;
	}

	var cacheManager = {
		cache: {}
	};


	/**
	 * @param {string} region
	 * @param {string} cacheKey
	 * @returns {*}
	 */
	cacheManager.getCache = function (region, cacheKey) {
		if ( ! cacheManager.hasCache(region, cacheKey)) {
			return null;
		}

		return cacheManager.cache[region][cacheKey];
	};


	/**
	 * @param {string} region
	 * @param {string} cacheKey
	 * @param {*} cache
	 * @returns {{cache: {}}}
	 */
	cacheManager.setCache = function (region, cacheKey, cache) {
		if ( ! cacheManager.hasCacheRegion(region)) {
			cacheManager.cache[region] = {};
		}

		if ( ! cacheManager.hasCache(region, cacheKey)) {
			cacheManager.cache[region][cacheKey] = cache;
		}

		return cacheManager;
	};


	/**
	 * @param {string} region
	 * @returns {boolean}
	 */
	cacheManager.hasCacheRegion = function (region) {
		return region in cacheManager.cache;
	};


	/**
	 * @param {string} region
	 * @param {string} cacheKey
	 * @returns {boolean}
	 */
	cacheManager.hasCache = function (region, cacheKey) {
		if ( ! cacheManager.hasCacheRegion(region)) {
			return false;
		}

		return cacheKey in cacheManager.cache[region];
	};

	var
		TEMPLATE_FUNCTIONS_CACHE_REGION = 'templateFunctions',
		TEMPLATE_RESULTS_CACHE_REGION = 'templateResults';


	/**
	 * @param {{}} renderingInstance
	 * @return {{}}
	 */
	function renderToString(renderingInstance) {
		renderingInstance._setStatus(renderingInstancesStatuses.renderingToString);

		var templateObject = renderingInstance.resultCacheEnabled
			? cacheManager.getCache(TEMPLATE_RESULTS_CACHE_REGION, renderingInstance._hash)
			: null;

		if ( ! templateObject) {
			templateObject = generateTemplateString(renderingInstance);
		}

		renderingInstance._setStatus(renderingInstancesStatuses.renderingToStringDone);

		return templateObject;
	}


	/**
	 * @param renderingInstance
	 * @returns {{}}
	 */
	function generateTemplateString(renderingInstance) {
		var
			cacheKeyIsSet = typeof renderingInstance.cacheKey === 'string',
			templateFunction = cacheKeyIsSet
				? cacheManager.getCache(TEMPLATE_FUNCTIONS_CACHE_REGION, renderingInstance.cacheKey)
				: null,
			data = renderingInstance.data,
			runtime = {
				parentInstance: renderingInstance.instanceId,
				components: getComponents(),
				getFilter: getFilter,
				renderedComponents: [],
				utils: utils,
				templateAdd: function (data, filter) {
					if (typeof data === 'undefined') {
						return '';
					}

					if ( ! Array.isArray(data)) {
						data = [data];
					}

					filter = filter === false ? null : filter;
					filter = filter === true ? 'escape' : filter;

					return filter ? this.getFilter(filter).apply(null, data) : data;
				}
			},
			template = renderingInstance.template,
			templateArguments = [runtime],
			templateParametersNames = ['_runtime'];

		if ( ! templateFunction) {
			if ( ! templateLiteralsEnabled) {
				template = template.replace(/(?:\r\n|\r|\n)/g, ' ');
				template = template.replace(/'/g, '\'');
			}

			var tokens = tokenizeTemplate(template);
			templateFunction = compileTemplate(tokens, templateParametersNames.concat(Object.keys(data)));

			if (cacheKeyIsSet) {
				cacheManager.setCache(TEMPLATE_FUNCTIONS_CACHE_REGION, renderingInstance.cacheKey, templateFunction);
			}
		}

		utils.each(data, function (key, value) {
			templateArguments.push(value);
		});

		var templateString = templateFunction.apply(null, templateArguments);

		if (renderingInstance._type === 'component') {
			templateString = templateString.replace(
				new RegExp(eventHandlersAttributeName + '=', 'g'),
				eventHandlersAttributeName + '-' + renderingInstance._hash + '='
			);

			var parentElement = new DOMParser().parseFromString(templateString, 'text/html').querySelector('body *');

			if (parentElement) {
				parentElement.setAttribute(selectorAttributeName, renderingInstance.instanceId);
				templateString = parentElement.outerHTML;
			}
		}

		if (renderingInstance.resultCacheEnabled) {
			cacheManager.setCache(TEMPLATE_RESULTS_CACHE_REGION, renderingInstance._hash, {
				templateString: templateString,
				templateRuntime: runtime
			});
		}

		return {
			templateString: templateString,
			templateRuntime: runtime
		};
	}

	/**
	 * @param {{}} renderingInstance
	 * @return {Element}
	 */
	function bindEventHandlers(renderingInstance) {
		renderingInstance._setStatus(renderingInstancesStatuses.bindingEventHandlers);

		var element = document.querySelector(renderingInstance.el);

		if ( ! element) {
			return;
		}

		var
			eventHandlersAttributeSuffix = renderingInstance._type === 'component' ? '-' + renderingInstance._hash : '',
			eventHandlersAttributeNameWithSuffix = eventHandlersAttributeName + eventHandlersAttributeSuffix,
			eventHandlersSelector = '[' + eventHandlersAttributeNameWithSuffix + ']',
			eventHandlers = [];

		utils.each(element.querySelectorAll(eventHandlersSelector), function (key, childrenElement) {
			eventHandlers.push(childrenElement);
		});

		if (element.getAttribute(eventHandlersAttributeNameWithSuffix)) {
			eventHandlers.push(element);
		}

		utils.each(eventHandlers, function (key, eventHandler) {
			var events = eventHandler.getAttribute(eventHandlersAttributeNameWithSuffix).split(';');

			utils.each(events, function (key, event) {
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

						if ( ! renderingInstance.methods || ! renderingInstance.methods[methodName]) {
							throw new Error('Brackets: Method "' + methodName + '" is not defined.');
						}

						eventFunction = renderingInstance.methods[methodName];
						eventArguments = [methodArguments];

					} else {
						eventFunction = new Function('data', 'this.' + event + '; return this;');
					}

					eventHandler.addEventListener(eventName, function (event) {
						eventFunction.apply(renderingInstance.data, [event].concat(eventArguments));
					});
				})(eventHandler, event);
			});

			if ( ! Brackets.config.devMode) {
				eventHandler.removeAttribute(eventHandlersAttributeNameWithSuffix);
			}
		});
	}

	function redrawInstance(instanceId) {
		var renderingInstance = getRenderingInstance(instanceId, false);

		if ( ! renderingInstance) {
			return;
		}

		var	targetElement = document.querySelector(renderingInstance.el);

		if ( ! targetElement) {
			return;
		}

		renderingInstance._setStatus(renderingInstancesStatuses.redrawing);

		utils.each(targetElement.querySelectorAll('[' + selectorAttributeName + ']'), function (key, instanceElement) {
			getRenderingInstance(instanceElement.getAttribute(selectorAttributeName))._destroy();
		});

		renderingInstance.beforeRender(targetElement);

		var
			templateObject = renderToString(renderingInstance),
			templateParentNode = new DOMParser()
				.parseFromString(templateObject.templateString, 'text/html')
				.querySelector(renderingInstance.el);

		if (templateParentNode) {
			templateObject.templateString = templateParentNode.innerHTML;
		}

		targetElement.innerHTML = templateObject.templateString;

		utils.each(templateObject.templateRuntime.renderedComponents, function (key, componentRenderingInstanceId) {
			var componentRenderingInstance = getRenderingInstance(componentRenderingInstanceId);
			bindEventHandlers(componentRenderingInstance);

			if (typeof componentRenderingInstance.afterRender === 'function') {
				componentRenderingInstance.afterRender.call(componentRenderingInstance, targetElement);
			}

			componentRenderingInstance._setStatus(renderingInstancesStatuses.redrawingDone);
		});

		bindEventHandlers(renderingInstance);
		targetElement.removeAttribute(nonInitializedElementAttributeName);
		renderingInstance.afterRender(targetElement);
		renderingInstance._setStatus(renderingInstancesStatuses.redrawingDone);
	}

	/**
	 * @param {{}} parameters
	 */
	function render(parameters) {
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

		if (targetElements.length > 1 && parameters.cacheKey && ! parameters.template) {
			throw new Error(
				'Brackets: you must provide a single template for \''
				+ parameters.cacheKey + '\' cacheKey because multiple target elements were found.'
			);
		}

		if ( ! targetElements) {
			return;
		}

		utils.each(targetElements, function (key, targetElement) {
			redrawInstance(createRenderingInstanceObject(parameters, targetElement).instanceId);
		});

		return Brackets;
	}

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

}));
