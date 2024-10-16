import { assert } from "utils/assert";

/**
 * Class representing an API client.
 */
export class Api {
  /**
   * Default configuration for the API client.
   * @private
   */
  static readonly #DEFAULTS: ApiDefaults = { headers: {} };

  /**
   * Configuration for the API client instance.
   * @private
   */
  readonly #config: ApiConfig;

  /**
   * Creates an instance of the API client.
   * @param baseUrl - The base URL for the API.
   * @param defaults - Default configuration overrides.
   */
  constructor(baseUrl: string, defaults: Partial<ApiDefaults> = {}) {
    this.#config = { baseUrl, defaults: this.#mergeDefaults(defaults) };
  }

  /**
   * Sends a GET request.
   * @param path - The endpoint path.
   * @param config - Optional request configuration.
   * @returns A promise that resolves to either the response data or an error.
   */
  async get<T, E = unknown>(...[path, config]: RequestArgs<"GET">): Promise<Either<T, E | Error>> {
    return this.#request<T, E>("GET", path, undefined, config);
  }

  /**
   * Sends a POST request.
   * @param path - The endpoint path.
   * @param data - The request body data.
   * @param config - Optional request configuration.
   * @returns A promise that resolves to either the response data or an error.
   */
  async post<T, E = unknown>(...[path, data, config]: RequestArgs<"POST">): Promise<Either<T, E | Error>> {
    return this.#request<T, E>("POST", path, data, config);
  }

  /**
   * Sends a PATCH request.
   * @param path - The endpoint path.
   * @param data - The request body data.
   * @param config - Optional request configuration.
   * @returns A promise that resolves to either the response data or an error.
   */
  async patch<T, E = unknown>(...[path, data, config]: RequestArgs<"PATCH">): Promise<Either<T, E | Error>> {
    return this.#request<T, E>("PATCH", path, data, config);
  }

  /**
   * Sends a PUT request.
   * @param path - The endpoint path.
   * @param data - The request body data.
   * @param config - Optional request configuration.
   * @returns A promise that resolves to either the response data or an error.
   */
  async put<T, E = unknown>(...[path, data, config]: RequestArgs<"PUT">): Promise<Either<T, E | Error>> {
    return this.#request<T, E>("PUT", path, data, config);
  }

  /**
   * Sends a DELETE request.
   * @param path - The endpoint path.
   * @param config - Optional request configuration.
   * @returns A promise that resolves to either the response data or an error.
   */
  async delete<T, E = unknown>(...[path, config]: RequestArgs<"DELETE">): Promise<Either<T, E | Error>> {
    return this.#request<T, E>("DELETE", path, undefined, config);
  }

  /**
   * Sets the Bearer token for authorization.
   * @param token - The Bearer token.
   */
  set bearerToken(token: string) {
    this.#setToken("Bearer", token);
  }

  /**
   * Sets the Basic token for authorization.
   * @param token - The Basic token.
   */
  set basicToken(token: string) {
    const base64Token = Buffer.from(token).toString("base64");
    this.#setToken("Basic", base64Token);
  }

  /**
   * Sets the authorization token.
   * @param type - The type of the token (e.g., Bearer, Basic).
   * @param token - The token string.
   * @private
   */
  #setToken(type: string, token: string) {
    assert(typeof token === "string" && token, "The token must be a non-empty string.");
    this.#config.defaults.headers.Authorization = `${type} ${token}`;
  }

  /**
   * Merges default configuration with provided overrides.
   * @param defaults - Default configuration overrides.
   * @returns The merged configuration.
   * @private
   */
  #mergeDefaults(defaults: Partial<ApiDefaults> = {}): ApiDefaults {
    return {
      ...Api.#DEFAULTS,
      ...defaults,
      headers: this.#mergeHeaders(Api.#DEFAULTS.headers, defaults.headers),
    };
  }

  /**
   * Merges base headers with provided headers.
   * @param baseHeaders - The base headers.
   * @param headers - The headers to merge.
   * @returns The merged headers.
   * @private
   */
  #mergeHeaders(baseHeaders: RequestHeaders, headers: RequestHeaders = {}): RequestHeaders {
    return { ...baseHeaders, ...headers };
  }

  /**
   * Parses request arguments.
   * @param path - The endpoint path.
   * @param config - Optional request configuration.
   * @param body - Optional request body.
   * @returns Either the parsed request data or an error.
   * @private
   */
  #parseArgs(path: string, config?: RequestConfig, body?: RequestBody): Either<RequestData, Error> {
    const urlResult = this.#buildUrl(path, config?.params);
    if (urlResult.kind === "failure") return urlResult;

    const headers = this.#mergeHeaders(this.#config.defaults.headers, config?.headers);

    if (config?.webhook && typeof body === "object") {
      (body as any).callback = config.webhook;
    }

    const bodyResult = this.#parseBody(body);
    if (bodyResult.kind === "failure") return bodyResult;

    return { kind: "success", value: [urlResult.value, headers, bodyResult.value] };
  }

  /**
   * Builds the full URL for the request.
   * @param path - The endpoint path.
   * @param params - Optional query parameters.
   * @returns Either the full URL or an error.
   * @private
   */
  #buildUrl(path: string, params: RequestParams = {}): Either<string, Error> {
    try {
      const url = new URL(path, this.#config.baseUrl);
      url.search = new URLSearchParams(params).toString();
      return { kind: "success", value: url.toString() };
    } catch {
      return {
        kind: "failure",
        value: new Error("An error occurred while trying to build the URL."),
      };
    }
  }

  /**
   * Parses the request body.
   * @param body - The request body.
   * @returns Either the parsed body or an error.
   * @private
   */
  #parseBody(body: RequestBody): Either<string, Error> {
    try {
      return { kind: "success", value: JSON.stringify(body) };
    } catch {
      return {
        kind: "failure",
        value: new Error("An error occurred while trying to parse the body."),
      };
    }
  }

  /**
   * Handles the response from the fetch request.
   * @param response - The fetch response.
   * @returns A promise that resolves to either the response data or an error.
   * @private
   */
  async #handleResponse<T, E>(response: Response): Promise<Either<T, E | Error>> {
    const dataResult = await this.#parseResponse<T | E>(response);
    if (dataResult.kind === "failure") return dataResult;

    return response.ok
      ? { kind: "success", value: dataResult.value as T }
      : { kind: "failure", value: dataResult.value as E };
  }

  /**
   * Parses the response data.
   * @param response - The fetch response.
   * @returns A promise that resolves to either the parsed data or an error.
   * @private
   */
  async #parseResponse<T>(response: Response): Promise<Either<T, Error>> {
    try {
      const data = await response.json();
      return { kind: "success", value: data as T };
    } catch {
      return {
        kind: "failure",
        value: new Error("An error occurred while trying to parse the data."),
      };
    }
  }

  /**
   * Sends an HTTP request.
   * @param method - The HTTP method.
   * @param path - The endpoint path.
   * @param body - Optional request body.
   * @param config - Optional request configuration.
   * @returns A promise that resolves to either the response data or an error.
   * @private
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
