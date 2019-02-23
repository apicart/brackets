import {utils} from '../../shared/utils';
import {selectorAttributeName} from '../../shared/variables';
import {bindPropertyDescriptors} from '../binders/bindPropertyDescriptiors';


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
