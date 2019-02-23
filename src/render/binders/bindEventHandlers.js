import {Brackets, eventHandlersAttributeName} from '../../shared/variables';
import {utils} from '../../shared/utils';
import {renderingInstancesStatuses} from '../runtime/renderingInstances';


/**
 * @param {{}} renderingInstance
 * @return {Element}
 */
export function bindEventHandlers(renderingInstance) {
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
