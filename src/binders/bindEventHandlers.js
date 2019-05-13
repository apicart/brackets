import { Brackets, eventHandlersAttributeName } from '../shared/variables';
import { utils } from '../shared/utils';


/**
 * @param {{}} renderingInstance
 */
export function bindEventHandlers(renderingInstance) {
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

				var eventNameMatch = event.match(/^(\S+)/)

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
