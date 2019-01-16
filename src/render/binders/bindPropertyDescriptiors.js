import {cloneObject, each} from '../../shared/utils';
import {redrawInstance} from '../redrawler';
import {renderingInstancesStatuses} from '../runtime/renderingInstances';


/**
 * @param {{}} renderingInstance
 */
export function bindPropertyDescriptors(renderingInstance) {
	renderingInstance._data = renderingInstance._data ? cloneObject(renderingInstance.data) : {};

	each(renderingInstance.data, function (propertyKey, propertyValue) {
		renderingInstance._data[propertyKey] = propertyValue;

		Object.defineProperty(renderingInstance.data, propertyKey, {
			get: function () {
				return renderingInstance._data[propertyKey];
			},
			set: function (value) {
				renderingInstance._data[propertyKey] = value;

				if (renderingInstance._status === renderingInstancesStatuses.rendered) {
					redrawInstance(renderingInstance.id);
				}
			}
		});
	});
}
