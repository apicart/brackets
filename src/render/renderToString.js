import {components, templateLiteralsEnabled} from '../shared/variables';
import {selectorAttributeName} from './shared/variables';
import {cloneObject, each} from '../shared/utils';
import {tokenizeTemplate} from '../compiler/tokenizeTemplate';
import {compileTemplate} from '../compiler/compileTemplate';

var templatesCache = {};

/**
 * @param {{}} parameters
 * @return {*}
 */
export function renderToString(parameters) {
	if (typeof parameters.beforeRender === 'function') {
		parameters.beforeRender.call(parameters);
	}

	var
		cacheKey = parameters.cacheKey || null,
		cacheKeyIsSet = typeof cacheKey === 'string',
		compiledTemplate,
		data = parameters.data ? cloneObject(parameters.data) : {},
		template = parameters.template || null,
		templateArguments = [];

	data['_runtime'] = {
		components: components,
		renderedComponents: []
	};

	if (cacheKeyIsSet && cacheKey in templatesCache) {
		compiledTemplate = templatesCache[cacheKey];

	} else {
		if ( ! templateLiteralsEnabled) {
			template = template.replace(/(?:\r\n|\r|\n)/g, ' ');
			template = template.replace(/'/g, '\'');
		}

		var tokens = tokenizeTemplate(template);
		compiledTemplate = compileTemplate(tokens, data);

		if (cacheKeyIsSet && ! (cacheKey in templatesCache)) {
			templatesCache[cacheKey] = compiledTemplate;
		}
	}

	if (data) {
		each(data, function (key, value) {
			templateArguments.push(value);
		});
	}

	var templateString = compiledTemplate.apply(null, templateArguments);

	if (parameters.componentHash) {
		templateString = templateString.replace('b-on=', 'b-on-' + parameters.componentHash + '=');
		var parentElement = new DOMParser().parseFromString(templateString, 'text/html').querySelector('body *');

		if (parentElement) {
			parentElement.setAttribute(selectorAttributeName, parameters.componentHash);
			templateString = parentElement.outerHTML;
		}
	}

	return {
		templateString: templateString,
		templateRuntime: data['_runtime']
	};
}
