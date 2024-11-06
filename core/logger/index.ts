import assert from "node:assert";
import type { Failure, Prototype } from "utils/types";

export class Logger implements Prototype<Logger> {
  #status = { enabled: true };
  prefix?: string;

  constructor(prefix?: string, status?: { enabled: boolean }) {
    if (status) this.#status = status;
    this.prefix = prefix;
  }

  set enabled(value: boolean) {
    assert(typeof value === "boolean", "Enabled must be a boolean");
    this.#status.enabled = value;
  }

  log(...messages: string[]) {
    if (this.#status.enabled) console.log(...this.#getMessage(messages));
  }

  info(...messages: string[]) {
    if (this.#status.enabled) console.info(...this.#getMessage(messages));
  }

  warn(...messages: string[]) {
    if (this.#status.enabled) console.warn(...this.#getMessage(messages));
  }

  error(...messages: string[]) {
    if (this.#status.enabled) console.error(...this.#getMessage(messages));
  }

  failure(result: Failure<any>) {
    this.error(JSON.stringify(result));
  }

  clone(): Logger {
    return new Logger(this.prefix, this.#status);
  }

  #getMessage(messages: string[]) {
    return [new Date(), ...(this.prefix ? [this.prefix, ...messages] : messages)];
  }
}
