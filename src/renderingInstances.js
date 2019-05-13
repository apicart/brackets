import { utils } from './shared/utils';
import { selectorAttributeName, nonInitializedElementAttributeName, Brackets } from './shared/variables';
import { bindPropertyDescriptors } from './binders/bindPropertyDescriptiors';
import { bindEventHandlers } from './binders/bindEventHandlers';
import { renderInstance } from './render/renderInstance';
import { renderComponent } from './render/renderComponent';


export var renderingInstances = {};

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
			methods: {},
			parentInstanceId: null,
			redrawingEnabled: true,
			resultCacheEnabled: parameters.resultCacheEnabled || false,
			type: parameters.type || 'view',
			template: parameters.template,

			addData: function (property, value) {
				this._data[property] = value;
				bindPropertyDescriptors(this);
				return this;
			},
			redraw: function () {
				renderInstance(this);
				return this;
			},

			created: function () {
				if (utils.isFunction(parameters.created)) {
					parameters.created();
				}

				return this;
			},
			mounted: function () {
				if (utils.isFunction(parameters.mounted)) {
					parameters.mounted();
				}

				return this;
			},
			updated: function () {
				if (utils.isFunction(parameters.updated)) {
					parameters.updated();
				}

				return this;
			},
			destroyed: function () {
				if (utils.isFunction(parameters.destroyed)) {
					parameters.destroyed();
				}

				return this;
			},

			destroy: function () {
				delete renderingInstances[this.instanceId];
				this.destroyed();

				return this;
			},
			destroyChildrenInstances: function () {
				destroyChildrenInstances(this);

				return this;
			},
			mount: function () {
				mountInstance(this);
				this.mounted();

				return this;
			},

			set instanceId(id) {
				this._instanceId = id;
			},
			get instanceId() {
				return this._instanceId ? this._instanceId + '-' + this.hash : this.hash;
			},
			get  parentInstance() {
				return getRenderingInstance(this.parentInstanceId);
			},

			_data: parameters.data ? utils.cloneObject(parameters.data) : {},
			_instanceId: null
		};

	instance.instanceId = parameters.instanceId || null;
	instance.elSelector = '[' + selectorAttributeName + '="' + instance.instanceId +'"]';

	if (instance.type === 'view') {
		instance.el = targetElement ? targetElement : null;

	} else {
		instance.el = targetElement ? targetElement : null;
	}

	if (instance.type === 'view') {
		instance.render = function () {
			renderInstance(this);
		}

	} else {
		instance.render = function (runtime, componentDataFromTemplate) {
			return renderComponent(runtime, this, componentDataFromTemplate);
		}
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

	if (getRenderingInstance(instance.instanceId, false)) {
		throw new Error('Brackets: Rendering instance "' + instance.instanceId +'" is already defined.');
	}

	renderingInstances[instance.instanceId] = instance;
	instance.created();

	return instance;
}


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


function mountInstance(instance) {
	bindEventHandlers(instance);

	if ( ! Brackets.config.devMode) {
		instance.el.removeAttribute(nonInitializedElementAttributeName);
		instance.el.removeAttribute('b-instance');
	}

	utils.each(instance.childrenInstancesIds, function (key, childrenInstanceId) {
		var childrenInstance = getRenderingInstance(childrenInstanceId);
		childrenInstance.el = instance.el.querySelector('[b-instance="' + childrenInstanceId + '"]');
		childrenInstance.mount();
	});
}
