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
		eventHandlersAttributeNameWithSuffix = eventHandlersAttributeName + '-' + renderingInstance.hash,
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

				if ( ! eventNameMatch || typeof eventNameMatch[1] === 'undefined') {
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
	utils.each(renderingInstance._data, function (propertyKey) {
		if (propertyKey in renderingInstance.data) {
			return;
		}

		Object.defineProperty(renderingInstance.data, propertyKey, {
			get: function () {
				return renderingInstance._data[propertyKey];
			},
			set: function (value) {
				renderingInstance._data[propertyKey] = value;

				if (renderingInstance.redrawingEnabled) {
					renderingInstance.redraw();
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

	if (typeof parameters.template === 'function') {
		parameters.template = parameters.template.call(parameters);
	}

	var
		instance = {
			childrenInstancesIds: [],
			cacheKey: parameters.cacheKey || null,
			data: {},
			hash: utils.generateHash(),
			isMounted: false,
			methods: {},
			parentInstanceId: null,
			redrawingEnabled: false,
			resultCacheEnabled: parameters.resultCacheEnabled || false,
			type: parameters.type || 'view',
			template: parameters.template,
			_data: parameters.data ? utils.cloneObject(parameters.data) : {},
			_instanceId: null,
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
			return renderInstance(this);
		};

	} else {
		instance.render = function (runtime, componentDataFromTemplate) {
			return renderComponent(runtime, this, componentDataFromTemplate);
		};
	}

	if (targetElement && ! targetElement.getAttribute(selectorAttributeName)) {
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

	bindPropertyDescriptors(instance);

	instance.beforeCreate();

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
	var instanceElementIsElement = instance.el instanceof Element;

	if (instanceElementIsElement) {
		bindEventHandlers(instance);
	}

	if (instanceElementIsElement && ! Brackets.config.devMode) {
		instance.el.removeAttribute(nonInitializedElementAttributeName);
		instance.el.removeAttribute('b-instance');
	}

	if (instance.isMounted) {
		instance.beforeUpdate();

	} else {
		instance.beforeMount();
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

	var
		templateObject = renderToString(instance),
		templateParentNode = new DOMParser().parseFromString(templateObject.templateString, 'text/html'),
		templateParentNodeFirstChild = templateParentNode.body.firstChild,
		replacingElement = templateParentNodeFirstChild instanceof Element
			? templateParentNodeFirstChild
			: templateParentNode.body.innerHTML,
		elementToBeReplaced = instance.el;

	instance.childrenInstancesIds = templateObject.templateRuntime.renderedComponents;
	instance.el = replacingElement;

	prepareInstanceForRendering(instance);

	if (replacingElement instanceof Element) {
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
