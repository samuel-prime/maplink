import { join } from "node:path";

/**
 * Extends the native URL class to provide additional functionality.
 *
 * @remarks
 * This class adds a setter for the `endpoint` property, which appends a given path to the current pathname.
 */
export class Url extends URL {
  /**
   * Sets the endpoint by appending the provided path to the current pathname.
   *
   * @param path - The path to append to the current pathname.
   *
   * @example
   * ```typescript
   * const url = new Url('https://example.com/api');
   * url.endpoint = '/v1/resource';
   * console.log(url.href); // 'https://example.com/api/v1/resource'
   * ```
   */
  set endpoint(path: string) {
    this.pathname = join(this.pathname, path);
  }
}
