/**
 * Represents a value that can either be a success or a failure.
 *
 * @template R - The type of the successful result.
 * @template E - The type of the error.
 */
export type Either<R, E> = Success<R> | Failure<E>;

/**
 * Represents a successful result with an associated success value.
 *
 * @template R - The type of the value contained in the success result.
 * @property {string} kind - A string literal type indicating the result is a success.
 * @property {R} value - The value of the successful result.
 */
export interface Success<R> {
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
export interface Failure<E> {
  kind: "failure";
  value: E;
  previous?: Failure<any>;
}

/**
 * Represents a prototype interface for objects that can be cloned.
 *
 * @template T - The type of the object that can be cloned.
 */
export interface Prototype<T extends object> {
  clone(): T;
}

/**
 * Represents a type that requires at least one element of type T.
 *
 * @template T - The type of the elements.
 *
 * @example
 * ```typescript
 * type Numbers = NonEmptyArray<number>;
 * const validNumbers: Numbers = [1]; // Valid
 * const moreNumbers: Numbers = [1, 2, 3]; // Valid
 * const noNumbers: Numbers = []; // Error: Type '[]' is not assignable to type 'NonEmptyArray<number>'
 * ```
 */
export type NonEmptyArray<T> = [T, ...T[]];

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
 * type UserWithIdOrName = NonEmptyObject<User, 'id' | 'name'>;
 *
 * const user1: UserWithIdOrName = { id: '123' }; // Valid
 * const user2: UserWithIdOrName = { name: 'John' }; // Valid
 * const user3: UserWithIdOrName = { id: '123', name: 'John' }; // Valid
 * const user4: UserWithIdOrName = {}; // Error: Type '{}' is not assignable to type 'NonEmptyObject<User, "id" | "name">'
 * ```
 */
export type NonEmptyObject<T, Keys extends keyof T = keyof T> = {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[Keys];

/**
 * A utility type that filters the keys of an object `T` to only those whose values are assignable to type `U`.
 *
 * @template T - The base object type.
 * @template U - The type to filter the keys by.
 * @template K - The keys of `T` to consider. Defaults to all keys of `T`.
 *
 * @example
 * ```typescript
 * interface Example {
 *   id: string;
 *   count: number;
 *   isActive: boolean;
 * }
 *
 * // Only keys with values assignable to `string`
 * type StringKeys = FilterKeys<Example, string>; // "id"
 *
 * // Only keys with values assignable to `number`
 * type NumberKeys = FilterKeys<Example, number>; // "count"
 * ```
 */
export type FilterKeys<T, U, K extends keyof T = keyof T> = {
  [P in K]: T[P] extends U ? P : never;
}[K];

/**
 * A generic type representing a constructor function for a class of type `T`.
 *
 * @template T - The type of the class instance that the constructor creates.
 */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * Converts a union type `U` to an intersection type.
 *
 * This utility type takes a union type `U` and transforms it into an intersection type.
 * It works by using conditional types and inference to achieve the transformation.
 *
 * @template U - The union type to be converted to an intersection type.
 * @returns The intersection type derived from the union type `U`.
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;
