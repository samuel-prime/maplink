/**
 * Represents a value that can either be a success or a failure.
 *
 * @template R - The type of the successful result.
 * @template E - The type of the error.
 */
declare type Either<R, E> = Success<R> | Failure<E>;

/**
 * Represents a successful result with an associated success value.
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
 * Represents a failure result with an associated error value.
 *
 * @template E - The type of the error value.
 *
 * @property {string} kind - Indicates the kind of result, which is always "failure" for this interface.
 * @property {E} value - The error value associated with the failure.
 * @property {Failure<any>} [previous] - An optional previous failure, allowing for chaining of failures.
 */
declare interface Failure<E> {
  kind: "failure";
  value: E;
  previous?: Failure<any>;
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
 *
 * @example
 * ```typescript
 * type Numbers = AtLeastOneInArray<number>;
 * const validNumbers: Numbers = [1]; // Valid
 * const moreNumbers: Numbers = [1, 2, 3]; // Valid
 * const noNumbers: Numbers = []; // Error: Type '[]' is not assignable to type 'AtLeastOneInArray<number>'
 * ```
 */
declare type AtLeastOneInArray<T> = [T, ...T[]];

/**
 * A utility type that ensures at least one of the specified keys is present in the given type `T`.
 *
 * @template T - The base type.
 * @template Keys - The keys of `T` that should be required at least one. Defaults to all keys of `T`.
 *
 * @typeParam T - The base type.
 * @typeParam Keys - The keys of `T` that should be required at least one. Defaults to all keys of `T`.
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email?: string;
 * }
 *
 * // At least one of 'id' or 'name' must be present
 * type UserWithIdOrName = AtLeastOneInObject<User, 'id' | 'name'>;
 *
 * const user1: UserWithIdOrName = { id: '123' }; // Valid
 * const user2: UserWithIdOrName = { name: 'John' }; // Valid
 * const user3: UserWithIdOrName = { id: '123', name: 'John' }; // Valid
 * const user4: UserWithIdOrName = {}; // Error: Type '{}' is not assignable to type 'AtLeastOneInObject<User, "id" | "name">'
 * ```
 */
declare type AtLeastOneInObject<T, Keys extends keyof T = keyof T> = {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[Keys];
