import { renderToString } from "./renderToString";
import { utils } from "../shared/utils";


/**
 * @param {{}} runtime
 * @param {{}} instance
 * @param {{}} componentDataFromTemplate
 * @return {string}
 */
export function renderComponent(runtime, instance, componentDataFromTemplate) {
	if (componentDataFromTemplate) {
		utils.each(componentDataFromTemplate, function (key, value) {
			instance.addData(key, value);
		});
    }

	instance.parentInstanceId = runtime.parentInstance.instanceId;
    var templateObject = renderToString(instance);

    instance.childrenInstancesIds = templateObject.templateRuntime.renderedComponents;
    runtime.renderedComponents = runtime.renderedComponents.concat([instance.instanceId]);

    return templateObject.templateString;
}
