function addPrefixAndroid (uiselectorString: string) {
  return `android=${uiselectorString}`;
}

function removePrefixAndroid (uiselectorString: string) {
  if (uiselectorString.startsWith("android=")) {
    return uiselectorString.replace("android=", "");
  }
  return uiselectorString;
}

function updateCharUiSelector (uiselectorString: string) {
  return uiselectorString.replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

/**
 * Get uiselector by resourceId
 * @param {string} resourceId
 * @returns {string}
 */
 export function getByResouceId (resourceId: string): string {
  return addPrefixAndroid(`new UiSelector().resourceId("${resourceId}")`);
}

/**
* Get uiselector by text
* @param {string} text
* @returns {string}
*/
export function getByText (text: string): string {
  return addPrefixAndroid(`new UiSelector().text("${text}")`);
}

/**
 * Get uiselector by text in scrollable
 * @param containerResouceId 
 * @param text 
 * @returns 
 */
export function getByTextInScrollable (containerResouceId: string, text: string): string {
  return addPrefixAndroid(`new UiScrollable(new UiSelector().resourceId("${containerResouceId}").scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("${text}"))`);
}

/**
* Get uiselector by class name
* @param {string} classNameString
* @param {number} index
* @returns {string}
*/
export function getByClassname (classNameString: string, index: number = 0): string {
  if (index === 0) {
    return addPrefixAndroid(`new UiSelector().className("${classNameString}")`);
  } else {
    return addPrefixAndroid(`new UiSelector().className("${classNameString}").instance(${index})`);
  }
}

/**
* Get uiselector by text and class name
* @param {string} classNameString
* @param {string} text
* @returns {string}
*/
export function getByClassnameAndText (classNameString: string, text: string): string {
  return addPrefixAndroid(`new UiSelector().className("${classNameString}").text("${text}")`);
}

/**
* Get uiselector by from parent
* @param {string} uiselector auto remove prefix android if contain
* @returns {string}
*/
export function getByFromParent (uiselector: string): string {
  return addPrefixAndroid(`new UiSelector().fromParent(${removePrefixAndroid(uiselector)})`);
}

/**
 * Get uiselector by resourceId in scrollable
 * @param {string} resourceId
 * @returns {string}
 */
export function getByResouceIdInScrollable (containerResouceId: string, resourceId: string): string {
  return addPrefixAndroid(`new UiScrollable(new UiSelector().resourceId("${containerResouceId}").scrollable(true).instance(0)).scrollIntoView(new UiSelector().resourceId("${resourceId}"))`);
}