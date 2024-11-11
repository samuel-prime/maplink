import { isObject } from "./is-object";

/**
 * Checks if a given value is empty. The value can be an object, array, map, or set.
 *
 * @param {object} value - The value to check for emptiness.
 * @returns {boolean} - Returns true if the value is empty, otherwise false.
 * @throws {Error} - Throws an error if the value is not an object, array, map, or set.
 */
export function isEmpty(value: object): boolean {
  if (isObject(value)) return Object.keys(value).length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Map) return value.size === 0;
  if (value instanceof Set) return value.size === 0;

  throw new Error("Value must be an object, array, map, or set.");
}
