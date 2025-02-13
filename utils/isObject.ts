/**
 * Determines whether the provided value is a plain object.
 *
 * @param {any} value - The value to evaluate.
 * @returns {boolean} True if the value is a plain object, false otherwise.
 */
export function isObject(value: any): boolean {
  return typeof value === "object" && value !== null && value.constructor === Object;
}
