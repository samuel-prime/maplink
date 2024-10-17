/**
 * Merges two objects into one.
 *
 * @template T - The type of the target object.
 * @template U - The type of the source object.
 * @param {T} target - The target object to merge into.
 * @param {U} source - The source object to merge from.
 * @returns {T & U} - A new object that is the result of merging the target and source objects.
 */
export function mergeObjects<T extends object, U extends object>(target: T, source: U): T & U {
  return { ...target, ...source };
}
