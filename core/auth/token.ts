import assert from "node:assert";
import { EventEmitter } from "node:stream";

/**
 * Token class to manage the Maplink's `access_token` lifecycle.
 * It emits an `update` event whenever the token is updated.
 */
export class Token {
  readonly #eventEmitter = new EventEmitter();
  readonly #intervalTime: number;
  #value?: string;
  #expiry?: number;

  constructor(interval: number) {
    this.#intervalTime = interval;
  }

  get value(): string | undefined {
    return this.#value;
  }

  /** Updates the token value and expiry time, emitting an `update` event afterwards. */
  set value(value: string) {
    assert(typeof value === "string" && value, "Token value must be a non-empty string.");
    this.#value = value;
    this.#expiry = Date.now() + this.#intervalTime;
    this.#eventEmitter.emit("update", this.#value);
  }

  get isValid(): boolean {
    return !!this.#value && !!this.#expiry && Date.now() < this.#expiry;
  }

  onUpdate(callback: (value: string) => void) {
    this.#eventEmitter.on("update", callback);
  }
}
