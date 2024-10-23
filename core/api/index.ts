import assert from "node:assert";
import EventEmitter from "node:events";
import { deepClone } from "utils/deep-clone";
import { deepMerge } from "utils/deep-merge";
import { Url } from "./url";

/**
 * Wrapper class around the `fetch` API that simplifies making HTTP requests.
 * It allows setting default *request configuration*, and provides methods for making requests.
 * Each instance is a `prototype` that can be cloned into new instances with the same configuration.
 */
export class Api implements Prototype<Api> {
  static readonly #DEFAULTS: Api.Defaults = { headers: {}, params: {} };

  readonly #eventEmitter: EventEmitter;
  readonly #config: Api.Config;

  constructor(baseUrl: string, defaults: Partial<Api.Defaults> = {}, emitter?: EventEmitter) {
    this.#eventEmitter = emitter ?? new EventEmitter();

    // Deep merge the class default configuration with the provided defaults.
    // Deep clone the Api `DEFAULTS` to avoid sharing the same object.
    this.#config = {
      baseUrl: new Url(baseUrl),
      defaults: deepMerge(deepClone(Api.#DEFAULTS), defaults),
    };
  }

  // Public Methods --------------------------------------------------------------------------------

  async get<T, E = unknown>(...[path, config]: Api.RequestArgs<"GET">) {
    return this.#request<T, E>("GET", path, undefined, config);
  }

  async post<T, E = unknown>(...[path, data, config]: Api.RequestArgs<"POST">) {
    return this.#request<T, E>("POST", path, data, config);
  }

  async patch<T, E = unknown>(...[path, data, config]: Api.RequestArgs<"PATCH">) {
    return this.#request<T, E>("PATCH", path, data, config);
  }

  async put<T, E = unknown>(...[path, data, config]: Api.RequestArgs<"PUT">) {
    return this.#request<T, E>("PUT", path, data, config);
  }

  async delete<T, E = unknown>(...[path, config]: Api.RequestArgs<"DELETE">) {
    return this.#request<T, E>("DELETE", path, undefined, config);
  }

  /**
   * Creates a new instance of the `Api` class with the same configuration and event emitter.
   * Emits a `clone` event with the new `Api` instance.
   */
  clone(): Api {
    const { baseUrl, defaults } = this.#config;
    // Deep clone the default configuration to avoid sharing the same object.
    const api = new Api(baseUrl.href, deepClone(defaults), this.#eventEmitter);
    this.#emit("clone", api);
    return api;
  }

  on<K extends keyof Api.Events>(event: K, listener: (...args: Api.Events[K]) => void) {
    this.#eventEmitter.on(event as string, listener);
  }

  // Getters and Setters ---------------------------------------------------------------------------

  get baseUrl(): Url {
    return this.#config.baseUrl;
  }

  /** Sets a token for the `Authorization` header in the `Bearer` format. */
  set bearerToken(token: string) {
    this.#setToken("Bearer", token);
  }

  /**
   * Sets a token for the `Authorization` header in the `Basic` format.
   * It encodes the token in `base64` before setting it.
   */
  set basicToken(token: string) {
    const base64Token = Buffer.from(token).toString("base64");
    this.#setToken("Basic", base64Token);
  }

  set header([key, value]: [keyof Api.RequestHeaders, string]) {
    this.#config.defaults.headers[key] = value;
  }

  set param([key, value]: [string, string | number | boolean]) {
    this.#config.defaults.params[key] = String(value);
  }

  // Private Methods -------------------------------------------------------------------------------

  #emit<K extends keyof Api.Events>(event: K, ...args: Api.Events[K]): boolean {
    return this.#eventEmitter.emit(event as string, ...args);
  }

  #setToken(type: string, token: string) {
    assert(typeof token === "string" && token, "The token must be a non-empty string.");
    this.#config.defaults.headers.Authorization = `${type} ${token}`;
  }

  #buildUrl(path: string, params: Api.RequestParams = {}): Either<string, Error> {
    try {
      const url = new Url(this.#config.baseUrl);
      url.endpoint = path;
      url.parameters = params;
      return { kind: "success", value: url.toString() };
    } catch (error) {
      return {
        kind: "failure",
        value: new Error("An error occurred while trying to build the URL."),
        previous: { kind: "failure", value: error },
      };
    }
  }

  #parseBody(body: Api.RequestBody): Either<string, Error> {
    try {
      const data = typeof body === "string" ? body : JSON.stringify(body);
      return { kind: "success", value: data };
    } catch (error) {
      return {
        kind: "failure",
        value: new Error("An error occurred while trying to parse the body."),
        previous: { kind: "failure", value: error },
      };
    }
  }

  #parseArgs(
    path: string,
    body?: Api.RequestBody,
    config?: Api.RequestConfig,
  ): Either<[string, string, Api.RequestHeaders], Error> {
    // Merge the default headers and params with the provided configuration.
    const headers = Object.assign(this.#config.defaults.headers, config?.headers);
    const params = Object.assign(this.#config.defaults.params, config?.params);

    const urlResult = this.#buildUrl(path, params);
    if (urlResult.kind === "failure") return urlResult;

    const bodyResult = this.#parseBody(body);
    if (bodyResult.kind === "failure") return bodyResult;

    return {
      kind: "success",
      value: [urlResult.value, bodyResult.value, headers],
    };
  }

  async #parseResponse<T>(response: Response): Promise<Either<T, Error>> {
    try {
      const data = await response.json();
      return { kind: "success", value: data as T };
    } catch (error) {
      return {
        kind: "failure",
        value: new Error("An error occurred while trying to parse the response."),
        previous: { kind: "failure", value: error },
      };
    }
  }

  async #handleResponse<T, E>(response: Response): Promise<Either<T, E | Error>> {
    const dataResult = await this.#parseResponse<T | E>(response);
    if (dataResult.kind === "failure") return dataResult;

    return response.ok
      ? { kind: "success", value: dataResult.value as T }
      : { kind: "failure", value: dataResult.value as E };
  }

  async #request<T, E>(
    method: Api.HttpMethods,
    path: string,
    payload?: Api.RequestBody,
    config?: Api.RequestConfig,
  ): Promise<Either<T, E | Error>> {
    try {
      const argsResult = this.#parseArgs(path, payload, config);
      if (argsResult.kind === "failure") throw argsResult;

      const [url, body, headers] = argsResult.value;
      const response = await fetch(url, { method, body, headers });

      const dataResult = await this.#handleResponse<T, E>(response);
      if (dataResult.kind === "failure") throw dataResult;

      return dataResult;
    } catch (error) {
      return {
        kind: "failure",
        value: new Error("An error occurred while trying to make a request."),
        previous: error instanceof Error ? { kind: "failure", value: error } : (error as any),
      };
    }
  }
}
