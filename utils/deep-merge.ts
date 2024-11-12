/**
 * Deeply merges an object `source` into an object `target`.
 * Properties from `source` will overwrite those in `target` if they exist.
 *
 * @template T - The type of the target object.
 * @template U - The type of the source object.
 *
 * @param {T} target - The target object to merge into.
 * @param {U} source - The source object to merge from.
 *
 * @returns {T & U} - The merged object containing properties from both `target` and `source`.
 *
 * @example
 * ```typescript
 * const target = { a: 1, b: { c: 2 } };
 * const source = { b: { d: 3 }, e: 4 };
 * const result = deepMerge(target, source);
 * console.log(result); // Output: { a: 1, b: { c: 2, d: 3 }, e: 4 }
 * ```
 */
export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge((target as any)[key], source[key]));
    }
  }

  Object.assign(target || {}, source);
  return target as T & U;
}
