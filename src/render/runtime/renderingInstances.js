import {cloneObject, each, generateHash} from '../../shared/utils';
import {selectorAttributeName} from '../../shared/variables';
import {bindPropertyDescriptors} from '../binders/bindPropertyDescriptiors';


export var renderingInstances = {};
export var renderingInstancesStatuses = {
	pending: 'pending',
	processing: 'processing',
	rendered: 'rendered'
};

export function getRenderingInstances(kind) {
	if ( ! kind) {
		return renderingInstances;
	}

	var selectedInstances = {};

	each(renderingInstances, function (id, instance) {
		if (instance._kind === kind) {
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

	return renderingInstances[id];
}


/**
 * @param {{}} parameters
 * @param {Element|null} targetElement
 * @return {{}}
 */
export function createRenderingInstanceObject(parameters, targetElement) {
	parameters = cloneObject(parameters);

	var
		instance = {
			afterRender: parameters.afterRender || function () {},
			beforeRender: parameters.beforeRender || function () {},
			cacheKey: parameters.cacheKey || null,
			data: parameters.data ? cloneObject(parameters.data) : {},
			methods: parameters.methods || {},
			onStatusChange: parameters.onStatusChange || function () {},
			template: parameters.template,
			_hash: generateHash(),
			_kind: parameters._kind || 'view',
			_parent: null,
			_setStatus: function (status) {
				this._status = status;
				this.onStatusChange.call(this, status);
			},
			_status: renderingInstancesStatuses.pending,
			set instanceId(id) {
				this._instanceId = id;
			},
			get instanceId() {
				return this._instanceId ? this._instanceId + '-' + this._hash : this._hash;
			},
			get el() {
				return '[' + selectorAttributeName + '="' + this.instanceId +'"]'
			},
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

	renderingInstances[instance.instanceId] = instance;

	return instance;
}
