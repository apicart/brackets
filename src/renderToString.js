import { renderTemplate } from './templateEngine/renderTemplate';


/**
 * @param {{}} renderingInstance
 * @return {{}}
 */
export function renderToString(renderingInstance) {
	return renderTemplate(renderingInstance.template, {
		cacheKey: renderingInstance._instanceId ? renderingInstance._instanceId : null,
		uniqueId: renderingInstance.instanceId,
		data: renderingInstance._data,
		type: renderingInstance.type,
		resultCacheEnabled: renderingInstance.resultCacheEnabled,
		runtime: {
			parentInstance: renderingInstance
		}
	});
}
