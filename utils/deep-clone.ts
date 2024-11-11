/**
 * Creates a deep clone of the given object.
 *
 * This function serializes the object to a JSON string and then parses it back to a new object.
 * It may not handle all edge cases, such as objects with circular references, functions, or private properties.
 *
 * @template T - The type of the object to be cloned.
 * @param {T} value - The object to be deep cloned.
 * @returns {T} A deep clone of the input object.
 */
export function deepClone<T extends object>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
