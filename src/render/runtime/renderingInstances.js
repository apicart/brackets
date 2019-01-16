import {cloneObject, each, generateHash} from '../../shared/utils';
import {selectorAttributeName} from '../../shared/variables';
import {bindPropertyDescriptors} from '../binders/bindPropertyDescriptiors';


export var renderingInstances = [];
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
	if ( !! required && ! (id in renderingInstances)) {
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
	var hash = targetElement ? targetElement.getAttribute(selectorAttributeName) : null;

	if ( ! hash) {
		hash = generateHash();

		if (targetElement) {
			targetElement.setAttribute(selectorAttributeName, hash);
		}
	}

	parameters.el = '[' + selectorAttributeName + '="' + hash +'"]';

	if ( ! parameters.template && targetElement) {
		parameters.template = targetElement.innerHTML;

	} else if (parameters.template && parameters.template.match(/^#\S+/)) {
		var templateElement = document.querySelector(parameters.template);

		if (templateElement) {
			parameters.template = templateElement.innerHTML;
		}

	} else if ( ! parameters.template && ! targetElement) {
		throw new Error('Brackets: No template or target element provided for rendering.');
	}

	var instance = {
		afterRender: parameters.afterRender || function () {},
		beforeRender: parameters.beforeRender || function () {},
		cacheKey: parameters.cacheKey || null,
		data: parameters.data ? cloneObject(parameters.data) : {},
		el: parameters.el ? parameters.el : '[' + selectorAttributeName + '="' + hash +'"]',
		id: parameters.instanceId || hash,
		methods: parameters.methods || {},
		onStatusChange: parameters.onStatusChange || function () {},
		template: parameters.template,
		_hash: hash,
		_kind: parameters._kind || 'view',
		_parent: null,
		_setStatus: function (status) {
			this._status = status;
			this.onStatusChange.call(this, status);
		},
		_status: renderingInstancesStatuses.pending
	};

	bindPropertyDescriptors(instance);

	if (getRenderingInstance(instance.id, false)) {
		throw new Error('Brackets: Rendering instance "' + instance.id +'" is already defined.');
	}

	renderingInstances[instance.id] = instance;

	return instance;
}
