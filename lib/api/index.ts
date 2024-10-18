import assert from "node:assert";
import EventEmitter from "node:events";
import { deepMerge } from "utils/deep-merge";
import { Url } from "./url";

/**
 * The `Api` class provides a wrapper around HTTP requests, allowing for easy configuration
 * and management of API calls. It supports various HTTP methods such as GET, POST, PATCH, PUT, and DELETE.
 *
 * The class also includes features for setting default headers and parameters, handling authorization tokens,
 * and emitting events through an `EventEmitter`.
 *
 * Example usage:
 *
 * ```typescript
 * const api = new Api("https://api.example.com", { headers: { "Content-Type": "application/json" } });
 *
 * api.get("/endpoint").then(response => {
 *   if (response.kind === "success") {
 *     console.log(response.value);
 *   } else {
 *     console.error(response.value);
 *   }
 * });
 * ```
 *
 * @template T - The type of the successful response data.
 * @template E - The type of the error response data.
 */
export class Api implements Prototype<Api> {
  static readonly #DEFAULTS: ApiDefaults = { headers: {}, params: {} };

  readonly #eventEmitter: EventEmitter;
  readonly #config: ApiConfig;

  constructor(baseUrl: string, defaults: Partial<ApiDefaults> = {}, emitter?: EventEmitter) {
    this.#eventEmitter = emitter ?? new EventEmitter();
    this.#config = { baseUrl: new Url(baseUrl), defaults: deepMerge(Api.#DEFAULTS, defaults) };
  }

  // Public Methods --------------------------------------------------------------------------------

  async get<T, E = unknown>(...[path, config]: RequestArgs<"GET">): Promise<Either<T, E | Error>> {
    return this.#request<T, E>("GET", path, undefined, config);
  }

  async post<T, E = unknown>(...[path, data, config]: RequestArgs<"POST">): Promise<Either<T, E | Error>> {
    return this.#request<T, E>("POST", path, data, config);
  }

  async patch<T, E = unknown>(...[path, data, config]: RequestArgs<"PATCH">): Promise<Either<T, E | Error>> {
    return this.#request<T, E>("PATCH", path, data, config);
  }

  async put<T, E = unknown>(...[path, data, config]: RequestArgs<"PUT">): Promise<Either<T, E | Error>> {
    return this.#request<T, E>("PUT", path, data, config);
  }

  async delete<T, E = unknown>(...[path, config]: RequestArgs<"DELETE">): Promise<Either<T, E | Error>> {
    return this.#request<T, E>("DELETE", path, undefined, config);
  }

  /**
   * Creates a new instance of the `Api` class with the same configuration and event emitter.
   * Emits a "clone" event with the new `Api` instance.
   *
   * @returns {Api} A new `Api` instance with the same configuration and event emitter.
   */
  clone(): Api {
    const api = new Api(this.#config.baseUrl.href, this.#config.defaults, this.#eventEmitter);
    this.#emit("clone", api);
    return api;
  }

  /**
   * Registers a listener for the specified event.
   */
  on<K extends keyof ApiEvents>(event: K, listener: (...args: ApiEvents[K]) => void): EventEmitter {
    return this.#eventEmitter.on(event as string, listener);
  }

  // Getters and Setters ---------------------------------------------------------------------------

  get baseUrl(): Url {
    return this.#config.baseUrl;
  }

  set bearerToken(token: string) {
    this.#setToken("Bearer", token);
  }

  set basicToken(token: string) {
    const base64Token = Buffer.from(token).toString("base64");
    this.#setToken("Basic", base64Token);
  }

  /**
   * Sets a header for the instance's default headers.
   *
   * @param {Array} header - An array containing the header key and value.
   */
  set header([key, value]: [RequestCommonHeaderNames & (string & {}), string]) {
    this.#config.defaults.headers[key] = value;
  }

  /**
   * Sets a param for the instance's default params.
   *
   * @param {Array} header - An array containing the header key and value.
   */
  set param([key, value]: [string, string | number | boolean]) {
    this.#config.defaults.params[key] = String(value);
  }

  // Private Methods -------------------------------------------------------------------------------

  /**
   * Emits an event with the specified arguments.
   */
  #emit<K extends keyof ApiEvents>(event: K, ...args: ApiEvents[K]): boolean {
    return this.#eventEmitter.emit(event as string, ...args);
  }

  /**
   * Sets the authorization token in the instance's default headers.
   */
  #setToken(type: string, token: string) {
    assert(typeof token === "string" && token, "The token must be a non-empty string.");
    this.#config.defaults.headers.Authorization = `${type} ${token}`;
  }

  /**
   * Builds the full URL for a request, including query parameters.
   */
  #buildUrl(path: string, params: RequestParams = {}): Either<string, Error> {
    try {
      const url = new Url(this.#config.baseUrl);
      url.endpoint = path;
      url.params = params;
      return { kind: "success", value: url.toString() };
    } catch {
      return { kind: "failure", value: new Error("An error occurred while trying to build the URL.") };
    }
  }

  /**
   * Parses the request body into a string format.
   */
  #parseBody(body: RequestBody): Either<string, Error> {
    try {
      return { kind: "success", value: typeof body === "string" ? body : JSON.stringify(body) };
    } catch {
      return { kind: "failure", value: new Error("An error occurred while trying to parse the body.") };
    }
  }

  /**
   * Parses the arguments for a request, including the URL, headers, and body.
   */
  #parseArgs(path: string, config?: RequestConfig, body?: RequestBody): Either<RequestData, Error> {
    const headers = Object.assign(this.#config.defaults.headers, config?.headers);
    const params = Object.assign(this.#config.defaults.params, config?.params);

    const urlResult = this.#buildUrl(path, params);
    if (urlResult.kind === "failure") return urlResult;

    if (config?.webhook && typeof body === "object") {
      (body as any).callback = config.webhook;
    }

    const bodyResult = this.#parseBody(body);
    if (bodyResult.kind === "failure") return bodyResult;

    return { kind: "success", value: [urlResult.value, headers, bodyResult.value] };
  }

  /**
   * Parses the response data from a fetch request.
   */
  async #parseResponse<T>(response: Response): Promise<Either<T, Error>> {
    try {
      const data = await response.json();
      return { kind: "success", value: data as T };
    } catch {
      return { kind: "failure", value: new Error("An error occurred while trying to parse the data.") };
    }
  }

  /**
   * Handles the response from a fetch request, parsing the data and handling errors.
   * It returns a success result if the response is OK, and a failure result otherwise.
   */
  async #handleResponse<T, E>(response: Response): Promise<Either<T, E | Error>> {
    const dataResult = await this.#parseResponse<T | E>(response);
    if (dataResult.kind === "failure") return dataResult;

    return response.ok
      ? { kind: "success", value: dataResult.value as T }
      : { kind: "failure", value: dataResult.value as E };
  }

  /**
   * Makes an HTTP request using the specified method, URL, body, and configuration.
   */
  async #request<T, E>(
    method: HttpMethods,
    path: string,
    body?: RequestBody,
    config?: RequestConfig,
  ): Promise<Either<T, E | Error>> {
    const result = this.#parseArgs(path, config, body);
    if (result.kind === "failure") return result;

    const [url, headers, requestBody] = result.value;

    try {
      const response = await fetch(url, { method, headers, body: requestBody });
      return this.#handleResponse<T, E>(response);
    } catch (error) {
      return {
        kind: "failure",
        value: new Error(`An error occurred while trying to make a request: ${(error as Error).message}`),
      };
    }
  }
}
