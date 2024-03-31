/**
 * Check if an object is empty
 * @param object The object to check
 * @returns True if the object is empty, false if not
 * @example
 * isEmpty({}); // true
 * isEmpty({ key: "value" }); // false
 */
export default function isEmpty(object: object) {
  return Object.keys(object).length === 0;
}