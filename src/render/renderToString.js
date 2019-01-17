import {templateLiteralsEnabled, selectorAttributeName, eventHandlersAttributeName} from '../shared/variables';
import {each} from '../shared/utils';
import {tokenizeTemplate} from './compiler/tokenizeTemplate';
import {compileTemplate} from './compiler/compileTemplate';
import {getFilter} from './runtime/filters';
import {getComponents} from './runtime/components';
import {renderingInstancesStatuses} from './runtime/renderingInstances';


var templatesCache = {};


/**
 * @param {{}} renderingInstance
 * @return {{}}
 */
export function renderToString(renderingInstance) {
	renderingInstance._setStatus(renderingInstancesStatuses.processing);

	if (typeof renderingInstance.beforeRender === 'function') {
		renderingInstance.beforeRender.call(renderingInstance);
	}

	var
		cacheKey = renderingInstance.cacheKey,
		cacheKeyIsSet = typeof cacheKey === 'string',
		compiledTemplate,
		data = renderingInstance.data,
		runtime = {
			parentInstance: renderingInstance.instanceId,
			components: getComponents(),
			getFilter: getFilter,
			renderedComponents: []
		},
		template = renderingInstance.template,
		templateArguments = [runtime],
		templateParametersNames = ['_runtime'];

	if (cacheKeyIsSet && cacheKey in templatesCache) {
		compiledTemplate = templatesCache[cacheKey];

	} else {
		if ( ! templateLiteralsEnabled) {
			template = template.replace(/(?:\r\n|\r|\n)/g, ' ');
			template = template.replace(/'/g, '\'');
		}

		var tokens = tokenizeTemplate(template);
		compiledTemplate = compileTemplate(tokens, templateParametersNames.concat(Object.keys(data)));

		if (cacheKeyIsSet && ! (cacheKey in templatesCache)) {
			templatesCache[cacheKey] = compiledTemplate;
		}
	}

	each(data, function (key, value) {
		templateArguments.push(value);
	});

	var templateString = compiledTemplate.apply(null, templateArguments);

	if (renderingInstance._kind === 'component') {
		templateString = templateString.replace(
			new RegExp(eventHandlersAttributeName + '=', 'g'),
			eventHandlersAttributeName + '-' + renderingInstance._hash + '='
		);

		var parentElement = new DOMParser().parseFromString(templateString, 'text/html').querySelector('body *');

		if (parentElement) {
			parentElement.setAttribute(selectorAttributeName, renderingInstance.instanceId);
			templateString = parentElement.outerHTML;
		}
	}

	renderingInstance._setStatus(renderingInstancesStatuses.rendered);

	return {
		templateString: templateString,
		templateRuntime: runtime
	};
}
