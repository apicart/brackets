import { utils } from './shared/utils';
import {
	selectorAttributeName,
	nonInitializedElementAttributeName,
	Brackets,
	eventHandlersAttributeName
} from './shared/variables';
import { renderComponent } from './runtime/components';
import { renderToString } from './renderToString';


export var renderingInstances = {};


/*
 * @param {{}} renderingInstance
 */
function bindEventHandlers(renderingInstance) {
	if ( ! renderingInstance.el) {
		return;
	}

	var
		eventHandlersAttributeNameWithSuffix = eventHandlersAttributeName + '-' + renderingInstance.instanceId,
		eventHandlersSelector = '[' + eventHandlersAttributeNameWithSuffix + ']',
		eventHandlers = [];

	utils.each(renderingInstance.el.querySelectorAll(eventHandlersSelector), function (key, childrenElement) {
		eventHandlers.push(childrenElement);
	});

	if (renderingInstance.el.getAttribute(eventHandlersAttributeNameWithSuffix)) {
		eventHandlers.push(renderingInstance.el);
	}

	utils.each(eventHandlers, function (key, eventHandler) {
		var events = eventHandler.getAttribute(eventHandlersAttributeNameWithSuffix).split(';');

		utils.each(events, function (key, event) {
			(function (eventHandler, event) {
				event = event.trim();

				var eventNameMatch = event.match(/^(\S+)/);

				if ( ! eventNameMatch || ! utils.isDefined(eventNameMatch[1])) {
					return;
				}

				var
					eventName = eventNameMatch[1],
					eventFunction,
					eventArguments = [];

				event = event.replace(eventName + ' ', '');

				var methodMatch = event.match(/\S+\(.*\)$/);

				if (methodMatch) {
					var
						methodMatches = event.match(/^([^(]+)\((.*)\)/),
						methodName = methodMatches[1],
						methodArguments = methodMatches[2];

					if ( ! renderingInstance.methods[methodName]) {
						throw new Error('Brackets: Method "' + methodName + '" is not defined.');
					}

					eventFunction = renderingInstance.methods[methodName];
					eventArguments = [methodArguments];

				} else {
					eventFunction = new Function('data', 'this.data.' + event + '; return this;');
				}

				eventHandler.addEventListener(eventName, function (event) {
					eventFunction.apply(renderingInstance, [event].concat(eventArguments));
				});
			})(eventHandler, event);
		});

		if ( ! Brackets.config.devMode) {
			eventHandler.removeAttribute(eventHandlersAttributeNameWithSuffix);
		}
	});
}


/**
 * @param {{}} renderingInstance
 */
function bindPropertyDescriptors(renderingInstance) {
	if ( ! renderingInstance._propertyDescriptorsInitialized) {
		renderingInstance._data = utils.cloneObject(renderingInstance.data);
		renderingInstance.data = {};
		renderingInstance._propertyDescriptorsInitialized = true;
	}

	utils.each(renderingInstance._data, function (propertyKey) {
		if (propertyKey in renderingInstance.data) {
			return;
		}

		Object.defineProperty(renderingInstance.data, propertyKey, {
			get: function () {
				return renderingInstance._data[propertyKey];
			},
			set: function (newValue) {
				var oldValue = renderingInstance._data[propertyKey];
				renderingInstance._data[propertyKey] = newValue;

				if (propertyKey in renderingInstance.watch) {
					renderingInstance.watch[propertyKey].call(renderingInstance, newValue, oldValue);
				}

				if (renderingInstance.redrawingEnabled) {
					renderingInstance.redrawingEnabled = false;
					renderingInstance.redraw();
					renderingInstance.redrawingEnabled = true;
				}
			}
		});
	});
}


/**
 * @param {{}} parameters
 * @param {Element|null} targetElement
 * @return {{}}
 */
export function createRenderingInstanceObject(parameters, targetElement) {
	parameters = utils.cloneObject(parameters);

	if (utils.isFunction(parameters.template)) {
		parameters.template = parameters.template.call(parameters);
	}

	var
		instance = {
			childrenInstancesIds: [],
			data: parameters.data ? utils.cloneObject(parameters.data) : {},
			hash: utils.generateHash(),
			isMounted: false,
			methods: {},
			parentInstanceId: null,
			redrawingEnabled: false,
			resultCacheEnabled: parameters.resultCacheEnabled || false,
			type: parameters.type || 'view',
			template: parameters.template,
			watch: parameters.watch || {},
			_data: {},
			_instanceId: null,
			_propertyDescriptorsInitialized: false,
			set instanceId(id) {
				this._instanceId = id;
			},
			get instanceId() {
				return this._instanceId ? this._instanceId + '-' + this.hash : this.hash;
			},
			get  parentInstance() {
				return getRenderingInstance(this.parentInstanceId);
			},


			addData: function (property, value) {
				this._data[property] = value;
				bindPropertyDescriptors(this);
				return this;
			},
			destroy: function () {
				this.beforeDestroy();

				destroyChildrenInstances(this);
				delete renderingInstances[this.instanceId];

				cacheManager.clearCache(TEMPLATE_RESULTS_CACHE_REGION, parameters._instanceId);
				cacheManager.clearCache(TEMPLATE_RESULTS_CACHE_REGION, parameters.instanceId);

				this.destroyed();

				return this;
			},
			redraw: function () {
				renderInstance(this);
				return this;
			},


			beforeCreate: function () {
				if (utils.isFunction(parameters.beforeCreate)) {
					parameters.beforeCreate.call(this);
				}

				return this;
			},
			created: function () {
				if (utils.isFunction(parameters.created)) {
					parameters.created.call(this);
				}

				return this;
			},

			beforeMount: function () {
				if (utils.isFunction(parameters.beforeMount)) {
					parameters.beforeMount.call(this);
				}

				return this;
			},
			mounted: function () {
				if (utils.isFunction(parameters.mounted)) {
					parameters.mounted.call(this);
				}

				instance.isMounted = true;
				instance.redrawingEnabled = true;

				return this;
			},

			beforeUpdate: function () {
				if (utils.isFunction(parameters.beforeUpdate)) {
					parameters.beforeUpdate.call(this);
				}

				return this;
			},
			updated: function () {
				if (utils.isFunction(parameters.updated)) {
					parameters.updated.call(this);
				}

				return this;
			},

			beforeDestroy: function () {
				if (utils.isFunction(parameters.beforeDestroye)) {
					parameters.beforeDestroy.call(this);
				}

				return this;
			},
			destroyed: function () {
				if (utils.isFunction(parameters.destroyed)) {
					parameters.destroyed.call(this);
				}

				return this;
			}
		};

	instance.instanceId = parameters.instanceId || null;
	instance.el = targetElement ? targetElement : null;

	if (instance.type === 'view') {
		instance.render = function () {
			// Render view
			return renderInstance(this);
		};

	} else {
		instance.render = function (runtime, componentDataFromTemplate) {
			return renderComponent(runtime, this, componentDataFromTemplate);
		};
	}

	if (targetElement && utils.isElement(targetElement) && ! targetElement.getAttribute(selectorAttributeName)) {
		targetElement.setAttribute(selectorAttributeName, instance.instanceId);
	}

	if ( ! parameters.template && targetElement) {
		instance.template = targetElement.outerHTML;

	} else if (parameters.template && parameters.template.match(/^#\S+/)) {
		var templateElement = document.querySelector(parameters.template);

		if (templateElement) {
			instance.template = templateElement.innerHTML;
		}

	} else if ( ! parameters.template && ! targetElement) {
		throw new Error('Brackets: No template or target element provided for rendering.');
	}

	utils.each(parameters.methods || {}, function (key, value) {
		instance.methods[key] = value;
	});

	instance.beforeCreate();

	bindPropertyDescriptors(instance);

	if (getRenderingInstance(instance.instanceId, false)) {
		throw new Error('Brackets: Rendering instance "' + instance.instanceId +'" is already defined.');
	}

	renderingInstances[instance.instanceId] = instance;

	instance.created();

	return instance;
}


/**
 * @param {{}} instance
 */
function destroyChildrenInstances(instance) {
	utils.each(instance.childrenInstancesIds, function (key, childrenInstanceId) {
		var childrenInstance = getRenderingInstance(childrenInstanceId, false);

		if ( ! childrenInstance) {
			return;
		}

		childrenInstance.destroy();
	});

	instance.childrenInstancesIds = [];
}


/**
 * @param {number} id
 * @returns {{}|null}
 */
export function findRenderingInstance(id) {
	var
		selectedInstances = findRenderingInstances(id),
		selectedInstancesKeys = Object.keys(selectedInstances);

	return selectedInstancesKeys.length ? selectedInstances[selectedInstancesKeys[0]] : null;
}


/**
 * @param {string} id
 * @param {boolean|null} required
 * @return {*}
 */
export function getRenderingInstance(id, required) {
	if (id === null) {
		return null;
	}

	if (required !== false && ! (id in renderingInstances)) {
		throw new Error('Brackets: Rendering instance "' + id +'" not found.');
	}

	return renderingInstances[id] || null;
}


/**
 * @param {number} id
 * @returns {[]}
 */
export function findRenderingInstances(id) {
	var selectedInstances = {};

	utils.each(renderingInstances, function (instanceId, instance) {
		if (instanceId.includes(id)) {
			selectedInstances[instanceId] = instance;
		}
	});

	return selectedInstances;
}


/**
 * @param {string} type
 */
export function getRenderingInstances(type) {
	if ( ! type) {
		return renderingInstances;
	}

	var selectedInstances = {};

	utils.each(renderingInstances, function (id, instance) {
		if (instance.type === type) {
			selectedInstances[id] = instance;
		}
	});

	return selectedInstances;
}


/**
 * @param {{}} instance
 */
function mountInstance(instance) {
	instance.mounted();

	utils.each(instance.childrenInstancesIds, function (key, childrenInstanceId) {
		var childrenInstance = getRenderingInstance(childrenInstanceId);
		mountInstance(childrenInstance);
	});
}


/**
 * @param {{}} instance
 */
function prepareInstanceForRendering(instance) {
	var instanceElementIsElement = utils.isElement(instance.el);

	if (instanceElementIsElement) {
		bindEventHandlers(instance);
	}

	if (instanceElementIsElement && ! Brackets.config.devMode) {
		instance.el.removeAttribute(nonInitializedElementAttributeName);
		instance.el.removeAttribute('b-instance');
	}

	utils.each(instance.childrenInstancesIds, function (key, childrenInstanceId) {
		var childrenInstance = getRenderingInstance(childrenInstanceId);
		childrenInstance.el = instance.el.querySelector('[b-instance="' + childrenInstanceId + '"]');
		prepareInstanceForRendering(childrenInstance);
	});
}


/**
 * @param {} instance
 */
function renderInstance(instance) {
	destroyChildrenInstances(instance);

	if (instance.isMounted) {
		instance.beforeUpdate();

	} else {
		instance.beforeMount();
	}

	var
		templateObject = renderToString(instance),
		templateParentNode = new DOMParser().parseFromString(templateObject.templateString, 'text/html'),
		templateParentNodeFirstChild = templateParentNode.body.firstChild,
		replacingElement = utils.isElement(templateParentNodeFirstChild)
			? templateParentNodeFirstChild
			: templateParentNode.body.innerHTML,
		elementToBeReplaced = instance.el;

	instance.childrenInstancesIds = templateObject.templateRuntime.renderedComponents;
	instance.el = replacingElement;

	prepareInstanceForRendering(instance);

	if (utils.isElement(replacingElement)) {
		elementToBeReplaced.parentElement.replaceChild(instance.el, elementToBeReplaced);

	} else {
		elementToBeReplaced.innerHTML = instance.el;
	}

	if (instance.isMounted) {
		instance.updated();

	} else {
		mountInstance(instance);
	}

	return instance;
}
