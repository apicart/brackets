import {each} from '../../shared/utils';
import {redrawInstance} from '../redrawler';


/**
 * @param {{}} renderingInstance
 */
export function bindPropertyDescriptors(renderingInstance) {
	each(renderingInstance.data, function (propertyKey, propertyValue) {
		if (propertyKey in renderingInstance._data) {
			return;
		}

		renderingInstance._data[propertyKey] = propertyValue;

		Object.defineProperty(renderingInstance.data, propertyKey, {
			get: function () {
				return renderingInstance._data[propertyKey];
			},
			set: function (value) {
				renderingInstance._data[propertyKey] = value;

				if (renderingInstance._redrawingEnabled) {
					redrawInstance(renderingInstance.instanceId);
				}
			}
		});
	});
}
