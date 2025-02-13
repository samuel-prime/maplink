import type { Failure as FailureType, Success as SuccessType } from "./types";

/**
 * Represents a failure result in an operation.
 *
 * @template T - The type of the value associated with the failure.
 * @template U - The type of the value associated with the previous failure.
 */
export class Failure<T, U = unknown> implements FailureType<T> {
  readonly kind = "failure";
  readonly value: T;
  readonly previous?: FailureType<U>;

  constructor(value: T, previous?: U | FailureType<U>) {
    this.value = value;
    if (previous) this.previous = previous instanceof Failure ? (previous as Failure<U>) : new Failure(previous as U);
  }
}

/**
 * Represents a success result in an operation.
 * @template T - The type of the value associated with the success.
 */
export class Success<T> implements SuccessType<T> {
  readonly kind = "success";

  constructor(readonly value: T) {}
}
