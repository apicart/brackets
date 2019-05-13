import { templateLiteralsEnabled, selectorAttributeName, eventHandlersAttributeName } from '../shared/variables';
import { utils } from '../shared/utils';
import { tokenizeTemplate } from '../compiler/tokenizeTemplate';
import { compileTemplate } from '../compiler/compileTemplate';
import { getFilter } from '../runtime/filters';
import { getComponent } from '../runtime/components';
import { getRenderingInstance } from '../renderingInstances';
import { cacheManager } from '../cacheManager';


var
	TEMPLATE_FUNCTIONS_CACHE_REGION = 'templateFunctions',
	TEMPLATE_RESULTS_CACHE_REGION = 'templateResults';


/**
 * @param {{}} renderingInstance
 * @return {{}}
 */
export function renderToString(renderingInstance) {
	var templateObject = renderingInstance.resultCacheEnabled
		? cacheManager.getCache(TEMPLATE_RESULTS_CACHE_REGION, renderingInstance.hash)
		: null;

	if ( ! templateObject) {
		templateObject = generateTemplateString(renderingInstance);
	}
	return templateObject;
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
		data = renderingInstance._data,
		runtime = {
			renderComponent: function (name, componentDataFromTemplate) {
				return getComponent(name).render(this, componentDataFromTemplate);
			},
			getFilter: getFilter,
			renderedComponents: [],
			utils: utils,
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
			},
			parentInstance: renderingInstance
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

	utils.each(data, function (key, value) {
		templateArguments.push(value);
	});

	var templateString = templateFunction.apply(null, templateArguments);

	templateString = templateString.replace(
		new RegExp(eventHandlersAttributeName + '=', 'g'),
		eventHandlersAttributeName + '-' + renderingInstance.hash + '='
	);

	if (renderingInstance.type === 'component') {
		var parentElement = new DOMParser().parseFromString(templateString, 'text/html').querySelector('body *');

		if (parentElement) {
			parentElement.setAttribute(selectorAttributeName, renderingInstance.instanceId);
			templateString = parentElement.outerHTML;
		}
	}

	if (renderingInstance.resultCacheEnabled) {
		cacheManager.setCache(TEMPLATE_RESULTS_CACHE_REGION, renderingInstance.hash, {
			templateString: templateString,
			templateRuntime: runtime
		});
	}

	return {
		templateString: templateString,
		templateRuntime: runtime
	};
}
