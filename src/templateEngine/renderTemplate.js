import { cacheManager } from "../cacheManager";
import { getComponent } from "../runtime/components";
import { utils } from "../shared/utils";
import { tokenizeTemplate } from "./tokenizeTemplate";
import { compileTemplate } from "./compileTemplate";
import { getFilter } from "../runtime/filters";
import { templateLiteralsEnabled, eventHandlersAttributeName, selectorAttributeName } from "../shared/variables";

var
	TEMPLATE_FUNCTIONS_CACHE_REGION = 'templateFunctions',
	TEMPLATE_RESULTS_CACHE_REGION = 'templateResults';

export function renderTemplate(template, parameters)
{
	// TODO Dořešit cachování - padají testy
	if (parameters.resultCacheEnabled
		&& parameters.hash
		&& cacheManager.hasCache(TEMPLATE_RESULTS_CACHE_REGION, parameters.hash)
	) {
		return cacheManager.getCache(TEMPLATE_RESULTS_CACHE_REGION, parameters.hash);
	}

	var
		cacheKeyIsSet = typeof parameters.cacheKey === 'string',
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
		templateArguments = [runtime],
		templateParametersNames = ['_runtime'];

	utils.each(parameters.runtime, function (key, value) {
		runtime[key] = value
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
		parameters.hash ? eventHandlersAttributeName + '-' + parameters.hash + '=' : eventHandlersAttributeName + '='
	);

	if (parameters.type === 'component') {
		var parentElement = new DOMParser().parseFromString(templateString, 'text/html').querySelector('body *');

		if (parentElement) {
			parentElement.setAttribute(selectorAttributeName, parameters.id);
			templateString = parentElement.outerHTML;
		}
	}

	// Todo, nebude se čistit cache. Při destoy instance je potřeba smazat cache instance či komponenty
	if (parameters.resultCacheEnabled) {
		cacheManager.setCache(TEMPLATE_RESULTS_CACHE_REGION, parameters.hash, {
			templateString: templateString,
			templateRuntime: runtime
		});
	}

	return {
		templateString: templateString,
		templateRuntime: runtime
	};
}
