import { renderTemplate } from './templateEngine/renderTemplate';


/**
 * @param {{}} renderingInstance
 * @return {{}}
 */
export function renderToString(renderingInstance) {
	return renderTemplate(renderingInstance.template, {
		cacheKey: renderingInstance.cacheKey,
		data: renderingInstance._data,
		id: renderingInstance.instanceId,
		hash: renderingInstance.hash,
		type: renderingInstance.type,
		resultCacheEnabled: renderingInstance.resultCacheEnabled,
		runtime: {
			parentInstance: renderingInstance
		}
	});
}
