import {Brackets} from '../shared/variables';
import {each} from '../shared/utils';

var eventHandlerAttributeName = 'b-on';

/**
 * @param {Element} element
 * @param {{}} parameters
 * @return {Element}
 */
export function attachEventHandlers(element, parameters) {
	var
		eventHandlersAttributeSuffix = parameters.componentHash ? '-' + parameters.componentHash : '',
		eventHandlersAttributeName = eventHandlerAttributeName + eventHandlersAttributeSuffix,
		eventHandlersSelector = '[' + eventHandlersAttributeName + ']',
		eventHandlers = element.querySelectorAll(eventHandlersSelector);

	each(eventHandlers, function (key, eventHandler) {
		var events = eventHandler.getAttribute(eventHandlersAttributeName).split(';');

		each(events, function (key, event) {
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

					if (typeof parameters.methods === 'undefined'
						|| typeof parameters.methods[methodName] === 'undefined'
					) {
						throw new Error('Brackets: Method "' + methodName + '" is not defined.');
					}

					eventFunction = parameters.methods[methodName];
					eventArguments = [methodArguments];

				} else {
					eventFunction = new Function('data', 'this.' + event + '; return this;');
				}

				eventHandler.addEventListener(eventName, function (event) {
					var redraw = eventFunction.apply(parameters.data, [event].concat(eventArguments)) || true;

					if ( ! redraw) {
						return false;
					}

					Brackets.render(parameters);
				});
			})(eventHandler, event);
		});

		if ( ! Brackets.devMode) {
			eventHandler.removeAttribute(eventHandlersAttributeName);
		}
	});
}
