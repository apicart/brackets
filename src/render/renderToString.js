import {templateLiteralsEnabled, selectorAttributeName, eventHandlersAttributeName} from '../shared/variables';
import {each} from '../shared/utils';
import {tokenizeTemplate} from './compiler/tokenizeTemplate';
import {compileTemplate} from './compiler/compileTemplate';
import {getFilter} from './runtime/filters';
import {getComponents} from './runtime/components';
import {renderingInstancesStatuses} from './runtime/renderingInstances';
import {cacheManager} from "./cacheManager";


var
	TEMPLATE_FUNCTIONS_CACHE_REGION = 'templateFunctions',
	TEMPLATE_RESULTS_CACHE_REGION = 'templateResults';


/**
 * @param {{}} renderingInstance
 * @return {{}}
 */
export function renderToString(renderingInstance) {
	renderingInstance._setStatus(renderingInstancesStatuses.renderingToString);

	var templateObject = {
		templateString: renderingInstance.resultCacheEnabled
			? cacheManager.getCache(TEMPLATE_RESULTS_CACHE_REGION, renderingInstance._hash)
			: null,
		templateRuntime: null
	};

	if ( ! templateObject.templateString) {
		templateObject = generateTemplateString(renderingInstance);
	}

	renderingInstance._setStatus(renderingInstancesStatuses.renderingToStringDone);

	return {
		templateString: templateObject.templateString,
		templateRuntime: templateObject.templateRuntime
	};
}


/**
 * @param renderingInstance
 * @returns {{}}
 */
function generateTemplateString(renderingInstance) {
	var
		cacheKeyIsSet = typeof renderingInstance.cacheKey === 'string',
		templateFunction = cacheKeyIsSet
			? cacheManager.getCache(TEMPLATE_FUNCTIONS_CACHE_REGION, renderingInstance.cacheKey)
			: null,
		data = renderingInstance.data,
		runtime = {
			parentInstance: renderingInstance.instanceId,
			components: getComponents(),
			getFilter: getFilter,
			renderedComponents: [],
			utils: {
				each: each
			},
			templateAdd: function (data, filter) {
				if (typeof data === 'undefined') {
					return '';
				}

				if ( ! Array.isArray(data)) {
					data = [data];
				}

				filter = filter === false ? null : filter;
				filter = filter === true ? 'escape' : filter;

				return filter ? this.getFilter(filter).apply(null, data) : data;
			}
		},
		template = renderingInstance.template,
		templateArguments = [runtime],
		templateParametersNames = ['_runtime'];

	if ( ! templateFunction) {
		if ( ! templateLiteralsEnabled) {
			template = template.replace(/(?:\r\n|\r|\n)/g, ' ');
			template = template.replace(/'/g, '\'');
		}

		var tokens = tokenizeTemplate(template);
		templateFunction = compileTemplate(tokens, templateParametersNames.concat(Object.keys(data)));

		if (cacheKeyIsSet) {
			cacheManager.setCache(TEMPLATE_FUNCTIONS_CACHE_REGION, renderingInstance.cacheKey, templateFunction);
		}
	}

	each(data, function (key, value) {
		templateArguments.push(value);
	});

	var templateString = templateFunction.apply(null, templateArguments);

	if (renderingInstance._type === 'component') {
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

	if (renderingInstance.resultCacheEnabled) {
		cacheManager.setCache(TEMPLATE_RESULTS_CACHE_REGION, renderingInstance._hash, templateString);
	}

	return {
		templateString: templateString,
		templateRuntime: runtime
	};
}
