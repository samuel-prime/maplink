import { isObject } from "./is-object";

/**
 * Converts the input data to a string.
 *
 * @param {any} data - The data to be converted to a string.
 * @returns {string} - The string representation of the input data.
 */
export function stringify(data: any): string {
  if (isObject(data) || Array.isArray(data)) return JSON.stringify(data);
  if (typeof data === "string") return data;
  return String(data);
}
