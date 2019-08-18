import { cacheManager } from '../cacheManager';
import { getComponent } from '../runtime/components';
import { utils } from '../shared/utils';
import { tokenizeTemplate } from './tokenizeTemplate';
import { compileTemplate } from './compileTemplate';
import { getFilter } from '../runtime/filters';
import { templateLiteralsEnabled, eventHandlersAttributeName, selectorAttributeName } from '../shared/variables';

var
	TEMPLATE_FUNCTIONS_CACHE_REGION = 'templateFunctions',
	TEMPLATE_RESULTS_CACHE_REGION = 'templateResults';

export function renderTemplate(template, parameters)
{
	if (parameters.resultCacheEnabled
		&& parameters.uniqueId
		&& cacheManager.hasCache(TEMPLATE_RESULTS_CACHE_REGION, parameters.uniqueId)
	) {
		return cacheManager.getCache(TEMPLATE_RESULTS_CACHE_REGION, parameters.uniqueId);
	}

	var
		cacheKeyIsSet = utils.isString(parameters.cacheKey),
		templateFunction = cacheKeyIsSet
			? cacheManager.getCache(TEMPLATE_FUNCTIONS_CACHE_REGION, parameters.cacheKey)
			: null,
		data = parameters.data,
		runtime = {
			renderComponent: function (name, componentDataFromTemplate) {
				return getComponent(name).render(this, componentDataFromTemplate);
			},
			renderTemplate: renderTemplate,
			getFilter: getFilter,
			renderedComponents: [],
			blocks: {},
			utils: utils,
			templateAdd: function (data, filter) {
				if ( ! utils.isDefined(data)) {
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
		templateArguments = [runtime],
		templateParametersNames = ['_runtime'];

	utils.each(parameters.runtime, function (key, value) {
		runtime[key] = value;
	});

	if ( ! templateFunction) {
		if ( ! templateLiteralsEnabled) {
			template = template.replace(/(?:\r\n|\r|\n)/g, ' ');
			template = template.replace(/'/g, '\'');
		}
		var tokens = tokenizeTemplate(template);
		templateFunction = compileTemplate(tokens, templateParametersNames.concat(Object.keys(data)));
		if (cacheKeyIsSet) {
			cacheManager.setCache(TEMPLATE_FUNCTIONS_CACHE_REGION, parameters.cacheKey, templateFunction);
		}
	}

	utils.each(data, function (key, value) {
		templateArguments.push(value);
	});

	var templateString = templateFunction.apply(null, templateArguments);

	templateString = templateString.replace(
		new RegExp(eventHandlersAttributeName + '=', 'g'),
		parameters.uniqueId
			? eventHandlersAttributeName + '-' + parameters.uniqueId + '='
			: eventHandlersAttributeName + '='
	);

	if (parameters.type === 'component') {
		var parentElement = new DOMParser().parseFromString(templateString, 'text/html').querySelector('body *');

		if (parentElement) {
			parentElement.setAttribute(selectorAttributeName, parameters.uniqueId);
			templateString = parentElement.outerHTML;
		}
	}

	if (parameters.resultCacheEnabled) {
		cacheManager.setCache(TEMPLATE_RESULTS_CACHE_REGION, parameters.uniqueId, {
			templateString: templateString,
			templateRuntime: runtime
		});
	}

	return {
		templateString: templateString,
		templateRuntime: runtime
	};
}
