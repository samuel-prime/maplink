import { join } from "node:path";

/**
 * Extends the built-in URL class to provide additional functionality for setting endpoints and query parameters.
 *
 * @remarks This class adds two new properties to the built-in URL class: `endpoint` and `params`.
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

  /**
   * Sets the query parameters for the URL.
   *
   * @param params - An object representing the query parameters as key-value pairs.
   *
   * @example
   * ```typescript
   * const url = new Url('https://example.com/api');
   * url.params = { key1: 'value1', key2: 'value2' };
   * console.log(url.href); // 'https://example.com/api?key1=value1&key2=value2'
   * ```
   */
  set params(params: Record<string, string>) {
    this.search = new URLSearchParams(params).toString();
  }
}
