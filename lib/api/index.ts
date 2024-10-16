import { assert } from "utils/assert";

export class Api {
  static readonly #DEFAULTS: ApiDefaults = { headers: {} };

  readonly #config: ApiConfig;

  constructor(baseUrl: string, defaults: Partial<ApiDefaults> = {}) {
    this.#config = { baseUrl, defaults: this.#mergeDefaults(defaults) };
  }

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

  set bearerToken(token: string) {
    this.#setToken("Bearer", token);
  }

  set basicToken(token: string) {
    const base64Token = Buffer.from(token).toString("base64");
    this.#setToken("Basic", base64Token);
  }

  #setToken(type: string, token: string) {
    assert(typeof token === "string" && token, "The token must be a non-empty string.");
    this.#config.defaults.headers.Authorization = `${type} ${token}`;
  }

  #mergeDefaults(defaults: Partial<ApiDefaults> = {}): ApiDefaults {
    return {
      ...Api.#DEFAULTS,
      ...defaults,
      headers: this.#mergeHeaders(Api.#DEFAULTS.headers, defaults.headers),
    };
  }

  #mergeHeaders(baseHeaders: RequestHeaders, headers: RequestHeaders = {}): RequestHeaders {
    return { ...baseHeaders, ...headers };
  }

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

  async #handleResponse<T, E>(response: Response): Promise<Either<T, E | Error>> {
    const dataResult = await this.#parseResponse<T | E>(response);
    if (dataResult.kind === "failure") return dataResult;

    return response.ok
      ? { kind: "success", value: dataResult.value as T }
      : { kind: "failure", value: dataResult.value as E };
  }

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
