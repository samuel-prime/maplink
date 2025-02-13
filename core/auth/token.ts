import assert from "node:assert";
import { EventEmitter } from "node:events";

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
