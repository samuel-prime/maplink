/**
 * Logger class to handle logging with different levels.
 */
export class Logger {
  #enabled = true;

  /**
   * Creates an instance of Logger.
   * @param {string} [name] - Optional name to prefix log messages.
   */
  constructor(readonly name?: string) {}

  /**
   * Enables the logger.
   */
  enable() {
    this.#enabled = true;
  }

  /**
   * Disables the logger.
   */
  disable() {
    this.#enabled = false;
  }

  /**
   * Logs messages at the 'log' level.
   * @param {...string[]} messages - Messages to log.
   */
  log(...messages: string[]) {
    if (this.#enabled) {
      console.log(new Date(), ...(this.name ? [this.name, ...messages] : messages));
    }
  }

  /**
   * Logs messages at the 'info' level.
   * @param {...string[]} messages - Messages to log.
   */
  info(...messages: string[]) {
    if (this.#enabled) {
      console.info(new Date(), ...(this.name ? [this.name, ...messages] : messages));
    }
  }

  /**
   * Logs messages at the 'warn' level.
   * @param {...string[]} messages - Messages to log.
   */
  warn(...messages: string[]) {
    if (this.#enabled) {
      console.warn(new Date(), ...(this.name ? [this.name, ...messages] : messages));
    }
  }

  /**
   * Logs messages at the 'error' level.
   * @param {...string[]} messages - Messages to log.
   */
  error(...messages: string[]) {
    if (this.#enabled) {
      console.error(new Date(), ...(this.name ? [this.name, ...messages] : messages));
    }
  }
}
