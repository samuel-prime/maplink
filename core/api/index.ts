import assert from "node:assert";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import EventEmitter from "node:events";
import { deepClone } from "utils/deep-clone";
import { deepMerge } from "utils/deep-merge";
import type { Either, Prototype } from "utils/types";
import { ApiFetch } from "./fetch";
import type { _Api, _Http } from "./types";
import { Url } from "./url";

/**
 * ### API
 * > A wrapper class around the `fetch` function that simplifies making HTTP requests.
 *
 * It allows setting default `request configurations`, adding request/response `hooks`, and listening to `events`.
 * Additionally, it provides methods to make `GET`, `POST`, `PATCH`, `PUT`, and `DELETE` requests.
 *
 * It uses `AsyncLocalStorage` to provide context to each API fetch operation.
 *
 * Each instance is a `prototype` that can be cloned into new instances with the same configuration and,
 * more importantly, the same `event emitter`, ensuring all clones share the same listeners.
 */
export class Api implements Prototype<Api> {
  static readonly #CONTEXT = new AsyncLocalStorage<_Api.AsyncContext>();

  readonly #config: _Api.Config;
  readonly #eventEmitter: EventEmitter;
  readonly #requestHooks: _Api.RequestHook[] = [];
  readonly #responseHooks: _Api.ResponseHook[] = [];

  constructor(baseUrl: string, defaults: Partial<_Api.Defaults> = {}, eventEmitter?: EventEmitter) {
    this.#config = {
      defaults: deepMerge({ headers: {}, params: {} }, defaults),
      baseUrl: new Url(baseUrl),
    };

    this.#eventEmitter = eventEmitter ?? new EventEmitter();
  }

  /**
   * Retrieves the current API context. **Throws an error if the context is not available.**
   */
  static getContext() {
    const context = Api.#CONTEXT.getStore();
    assert(context, "The API context is not available. Set a context before making an API fetch.");
    return context;
  }

  // #region HTTP Methods
  async get<T, E = unknown>(...[path, config]: _Api.GetRequestArgs<"GET">) {
    return this.#fetch<T, E>("GET", path, undefined, config);
  }

  async post<T, E = unknown>(...[path, data, config]: _Api.GetRequestArgs<"POST">) {
    return this.#fetch<T, E>("POST", path, data, config);
  }

  async patch<T, E = unknown>(...[path, data, config]: _Api.GetRequestArgs<"PATCH">) {
    return this.#fetch<T, E>("PATCH", path, data, config);
  }

  async put<T, E = unknown>(...[path, data, config]: _Api.GetRequestArgs<"PUT">) {
    return this.#fetch<T, E>("PUT", path, data, config);
  }

  async delete<T, E = unknown>(...[path, config]: _Api.GetRequestArgs<"DELETE">) {
    return this.#fetch<T, E>("DELETE", path, undefined, config);
  }
  // #endregion HTTP Methods end

  /**
   * Adds a request or response hook to the appropriate list.
   *
   * These hooks are executed before making the request and after receiving the response, respectively.
   * They can be used to modify the request/response data or to perform additional actions.
   */
  appendHook<T extends keyof _Api.Hooks>(type: T, hook: _Api.Hooks[T]) {
    type === "beforeRequest"
      ? this.#requestHooks.push(hook as _Api.RequestHook)
      : this.#responseHooks.push(hook as _Api.ResponseHook);
  }

  // #region Event Emitter
  on<K extends keyof _Api.Events>(event: K, listener: (...args: _Api.Events[K]) => void) {
    this.#eventEmitter.on(event, listener);
  }

  #emit<K extends keyof _Api.Events>(event: K, ...args: _Api.Events[K]): boolean {
    return this.#eventEmitter.emit(event, ...args);
  }
  // #endregion Event Emitter end

  // #region Config
  get baseUrl(): Url {
    return this.#config.baseUrl;
  }

  set headers([key, value]: [keyof _Http.Headers, string]) {
    this.#config.defaults.headers[key] = value;
  }

  set params([key, value]: [string, string | number | boolean]) {
    this.#config.defaults.params[key] = String(value);
  }

  /**
   * Sets a token for the `Authorization` header in the `Bearer` format.
   */
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

  #setToken(type: string, token: string) {
    assert(typeof token === "string" && token, "The token must be a non-empty string.");
    this.#config.defaults.headers.Authorization = `${type} ${token}`;
  }
  // #endregion Config end

  // #region Fetch
  /**
   * Performs an HTTP request using the `ApiFetch` class and returns the response data.
   */
  async #fetch<T, E>(
    method: _Http.Methods,
    endpoint: string,
    body: _Api.RequestBody,
    specificConfig: _Api.RequestConfig = {},
  ): Promise<Either<T, E | Error>> {
    const config = deepMerge(deepClone(this.#config.defaults), specificConfig);
    const url = this.baseUrl.clone(endpoint);

    const id = config.id ?? randomUUID();
    const emitEvent = this.#emit.bind(this);
    const requestHooks = [...this.#requestHooks, ...(config.beforeRequest ?? [])];
    const responseHooks = [...this.#responseHooks, ...(config.afterResponse ?? [])];

    return Api.#CONTEXT.run({ id, emitEvent, requestHooks, responseHooks }, async () => {
      const fetch = new ApiFetch<T, E>(method, url, body, config);
      return (await fetch.response).data();
    });
  }
  // #endregion Fetch end

  /**
   * Creates a new instance of the Api class with the same configuration and `event emitter`.
   * Emits a `clone` event with the new instance as an argument.
   */
  clone(): Api {
    const api = new Api(this.#config.baseUrl.href, deepClone(this.#config.defaults));
    this.#eventEmitter.emit("clone", api);
    return api;
  }
}
