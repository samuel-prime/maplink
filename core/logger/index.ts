import assert from "node:assert";

/**
 * Simple logger class to log messages at different levels.
 *
 * Each instance created via the `clone` method will have the same status reference as it's parent,
 * which means that if the parent is `disabled`, the child will also be `disabled`.
 */
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

  /**
   * Clones the current logger instance, passing the same status reference to the new one.
   * This will make all clones from this instance onwards to share the same status reference.
   */
  clone(): Logger {
    return new Logger(this.prefix, this.#status);
  }

  #getMessage(messages: string[]) {
    return [new Date(), ...(this.prefix ? [this.prefix, ...messages] : messages)];
  }
}
