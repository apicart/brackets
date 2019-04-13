import {utils} from '../../shared/utils';
import {selectorAttributeName} from '../../shared/variables';
import {bindPropertyDescriptors} from '../binders/bindPropertyDescriptiors';
import {bindEventHandlers} from '../binders/bindEventHandlers';


export var renderingInstances = {};
export var renderingInstancesStatuses = {
	bindingEventHandlers: 'bindingEventHandlers',
	create: 'create',
	destroy: 'destroy',
	pending: 'pending',
	redrawing: 'redrawing',
	renderingToString: 'renderingToString',
	renderingToStringDone: 'renderToStringDone',
	redrawingDone: 'redrawingDone'
};

export function getRenderingInstances(type) {
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
			cacheKey: parameters.cacheKey || null,
			data: parameters.data ? utils.cloneObject(parameters.data) : {},
			methods: parameters.methods || {},
			onStatusChange: parameters.onStatusChange || function () {},
			resultCacheEnabled: parameters.resultCacheEnabled || false,
			template: parameters.template,

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
			addData: function (property, value) {
				this.data[property] = value;
				bindPropertyDescriptors(this);

				return this;
			},

			_childrenInstancesIds: [],
			_data: {},
			_hash: utils.generateHash(),
			_parentInstanceId: null,
			_redrawingEnabled: true,
			_status: renderingInstancesStatuses.pending,
			_type: parameters._type || 'view',

			_bindEventHandlers: function () {
				bindEventHandlers(this);

				return this;
			},
			_create: function () {
				this._setStatus(renderingInstancesStatuses.create);
				renderingInstances[this.instanceId] = this;

				return this;
			},
			_destroy: function () {
				this._setStatus(renderingInstancesStatuses.destroy);
				delete renderingInstances[this.instanceId];
			},
			_destroyChildrenInstances: function () {
				utils.each(this._childrenInstancesIds, function (key, childrenInstanceId) {
					var childrenInstance = getRenderingInstance(childrenInstanceId, false);

					if ( ! childrenInstance) {
						return;
					}

					childrenInstance._destroy();
				});

				this._childrenInstancesIds = [];

				return this;
			},
			_initChildrenInstances: function () {
				utils.each(this._childrenInstancesIds, function (key, childrenInstanceId) {
					var childrenInstance = getRenderingInstance(childrenInstanceId);
					childrenInstance._initChildrenInstances();
					var targetElement = childrenInstance.el;

					childrenInstance._bindEventHandlers();

					if (typeof childrenInstance.afterRender === 'function') {
						childrenInstance.afterRender.call(childrenInstance, targetElement);
					}

					childrenInstance._setStatus(renderingInstancesStatuses.redrawingDone);
				});

				return this;
			},
			_setStatus: function (status) {
				if (this._status === status) {
					return this;
				}

				this._status = status;
				this.onStatusChange.call(this, status);

				return this;
			},

			set instanceId(id) {
				this._instanceId = id;
			},
			get instanceId() {
				return this._instanceId ? this._instanceId + '-' + this._hash : this._hash;
			},
			get el() {
				return '[' + selectorAttributeName + '="' + this.instanceId +'"]';
			},
			get _parentInstance() {
				return getRenderingInstance(this._parentInstanceId);
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
