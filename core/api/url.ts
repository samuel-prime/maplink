import { assert } from "node:console";
import { join } from "node:path";
import type { Prototype } from "utils/types";

/**
 * Extends the native `URL` class to provide additional functionality.
 */
export class Url extends URL implements Prototype<Url> {
  /**
   * Sets the endpoint of the URL by joining the current pathname with the provided path.
   * **Throws an error if the provided endpoint is not a string.**
   */
  set endpoint(endpoint: string) {
    assert(typeof endpoint === "string", "Endpoint must be a string.");
    this.pathname = join(this.pathname, endpoint);
  }

  /**
   * Sets the query search of the URL by converting the provided object into a query string.
   *
   * If no parameters are provided, the search will be set to an empty string.
   * Otherwise, it will be set to the provided parameter values that are either `strings`, `numbers`, or `booleans`.
   *
   * **Throws an error if the provided parameters are not an object.**
   */
  set parameters(params: Record<string, string | number | boolean>) {
    if (!params) {
      this.search = "";
      return;
    }

    assert(typeof params === "object" && !Array.isArray(params), "Params must be an object.");

    const VALID_TYPES = ["string", "number", "boolean"];
    const searchParams: [string, string][] = [];

    for (const key in params) {
      const value = params[key];
      if (VALID_TYPES.includes(typeof value)) searchParams.push([key, String(value)]);
    }

    this.search = new URLSearchParams(searchParams).toString();
  }

  /**
   * Clones the current instance, optionally updating the endpoint and parameters.
   */
  clone(endpoint?: string, params?: Record<string, string | number | boolean>) {
    const url = new Url(this.href);
    if (endpoint) url.endpoint = endpoint;
    if (params) url.parameters = params;
    return url;
  }
}
