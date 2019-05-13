import { utils } from '../shared/utils';


/**
 * @param {{}} renderingInstance
 */
export function bindPropertyDescriptors(renderingInstance) {
	utils.each(renderingInstance._data, function (propertyKey, propertyValue) {
		if (propertyKey in renderingInstance.data) {
			return;
		}

		Object.defineProperty(renderingInstance.data, propertyKey, {
			get: function () {
				return renderingInstance._data[propertyKey];
			},
			set: function (value) {
				renderingInstance._data[propertyKey] = value;
				renderingInstance.redraw();
			}
		});
	});
}
