/**
 * Asserts that a given condition is true. If the condition is false, it throws an error with the provided message.
 *
 * @template T - The type of the condition to assert.
 * @param {T} condition - The condition to evaluate.
 * @param {string} message - The error message to throw if the condition is false.
 * @throws {Error} Throws an error if the condition is false.
 */
export function assert<T>(condition: T, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
