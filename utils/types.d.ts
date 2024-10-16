/**
 * Represents a value that can either be a success or a failure.
 *
 * @template R - The type of the successful result.
 * @template E - The type of the error.
 */
declare type Either<R, E> = Success<R> | Failure<E>;

/**
 * Represents a successful result.
 *
 * @template R - The type of the value contained in the success result.
 * @property {string} kind - A string literal type indicating the result is a success.
 * @property {R} value - The value of the successful result.
 */
declare interface Success<R> {
  kind: "success";
  value: R;
}

/**
 * Represents a failure result.
 *
 * @template E - The type of the error value.
 * @property {string} kind - The kind of result, which is always "failure" for this interface.
 * @property {E} value - The error value associated with the failure.
 */
declare interface Failure<E> {
  kind: "failure";
  value: E;
}

/**
 * Represents a prototype interface for objects that can be cloned.
 *
 * @template T - The type of the object that can be cloned.
 */
declare interface Prototype<T extends object> {
  clone(): T;
}

/**
 * Represents a type that requires at least one element of type T.
 *
 * @template T - The type of the elements.
 */
declare type AtLeastOne<T> = [T, ...T[]];
