import assert from "node:assert";
import { AsyncLocalStorage } from "node:async_hooks";
import EventEmitter from "node:events";
import { deepClone } from "utils/deep-clone";
import type { Http, Prototype } from "utils/types";
import { ApiAsyncContext } from "./async-context";
import { ApiConfig, type ApiDefaults } from "./config";
import { ApiFetch } from "./fetch";
import { ApiHook, ApiHookManager } from "./hook";
import type { _Api } from "./types";
import type { Url } from "./url";

export class Api implements Prototype<Api> {
  static readonly #CONTEXT = new AsyncLocalStorage<_Api.AsyncContext>();

  readonly #hookManager: ApiHookManager;
  readonly #eventEmitter: EventEmitter;
  readonly #config: ApiConfig;

  constructor(pathname: string, hookManager?: ApiHookManager, eventEmitter?: EventEmitter) {
    this.#hookManager = hookManager ?? new ApiHookManager();
    this.#eventEmitter = eventEmitter ?? new EventEmitter();
    this.#config = new ApiConfig(pathname);
  }

  static getContext() {
    const context = Api.#CONTEXT.getStore();
    assert(context, "The API context is not available. Set a context before making an API fetch.");
    return context;
  }

  async get<T, E = unknown>(path: string, config?: _Api.Fetch.Config) {
    return this.#fetch<"GET", T, E>("GET", path, config);
  }

  async post<T, E = unknown>(path: string, body?: _Api.Request.Body, config?: _Api.Fetch.Config) {
    return this.#fetch<"POST", T, E>("POST", path, body, config);
  }

  async patch<T, E = unknown>(path: string, body?: _Api.Request.Body, config?: _Api.Fetch.Config) {
    return this.#fetch<"PATCH", T, E>("PATCH", path, body, config);
  }

  async put<T, E = unknown>(path: string, body?: _Api.Request.Body, config?: _Api.Fetch.Config) {
    return this.#fetch<"PUT", T, E>("PUT", path, body, config);
  }

  async delete<T, E = unknown>(path: string, config?: _Api.Fetch.Config) {
    return this.#fetch<"DELETE", T, E>("DELETE", path, config);
  }

  on<K extends _Api.Events.Names>(event: K, listener: _Api.Events.Listener<K>) {
    this.#eventEmitter.on(event, listener);
  }

  #emit<K extends _Api.Events.Names>(event: K, ...args: _Api.Events.List[K]): boolean {
    return this.#eventEmitter.emit(event, ...args);
  }

  getListeners<K extends _Api.Events.Names>(event: K) {
    return this.#eventEmitter.listeners(event) as _Api.Events.Listener<K>[];
  }

  removeListener<K extends _Api.Events.Names>(event: string, listener: _Api.Events.Listener<K>) {
    this.#eventEmitter.removeListener(event, listener);
  }

  beforeFetch(hook: _Api.Hooks.Function) {
    return this.#handleHookCreation(new ApiHook("beforeFetch", hook, this));
  }

  afterFetch(hook: _Api.Hooks.Function) {
    return this.#handleHookCreation(new ApiHook("afterFetch", hook, this));
  }

  removeHook(hook: ApiHook) {
    this.#hookManager.remove(hook);
    this.#emit("hookRemove", hook);
  }

  #handleHookCreation(hook: ApiHook) {
    this.#hookManager.append(hook);
    this.#emit("hookAppend", hook);

    return Object.freeze({
      global: () => this.#hookManager.changeToGlobal(hook),
      once: function () {
        hook.once();
        return Object.freeze({ global: this.global });
      },
    });
  }

  get baseUrl(): Url {
    return this.#config.baseUrl;
  }

  get defaults(): ApiDefaults {
    return this.#config.defaults;
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
    this.#config.defaults.headers ??= {};
    this.#config.defaults.headers.authorization = `${type} ${token}`;
  }

  async #fetch<K extends Http.Methods, T, E>(...args: _Api.Fetch.GetArgs<K>) {
    const { config } = this.#resolveFetchArgs(args);

    return Api.#CONTEXT.run(this.#createAsyncContext(args), async () => {
      const fetch = new ApiFetch<T, E>(config?.name ?? this.defaults.name);
      return (await fetch.response).data;
    });
  }

  #createAsyncContext<K extends Http.Methods>(args: _Api.Fetch.GetArgs<K>) {
    const { config } = this.#resolveFetchArgs(args);

    const requestConfig = this.#getContextRequestConfig(args);
    const hooks = this.#getContextHooks(config?.hooks);
    const emitter = this.#emit.bind(this);

    return new ApiAsyncContext(requestConfig, emitter, hooks);
  }

  #getContextHooks(hooks?: _Api.Fetch.Config["hooks"]): _Api.AsyncContext["hooks"] {
    const beforeFetchHooks = hooks?.beforeFetch?.map((hook) => new ApiHook("beforeFetch", hook)) ?? [];
    const afterFetchHooks = hooks?.afterFetch?.map((hook) => new ApiHook("afterFetch", hook)) ?? [];

    const beforeFetch = [...this.#hookManager.beforeFetch(this), ...beforeFetchHooks];
    const afterFetch = [...this.#hookManager.afterFetch(this), ...afterFetchHooks];

    return Object.freeze({ beforeFetch, afterFetch });
  }

  #getContextRequestConfig<K extends Http.Methods>(args: _Api.Fetch.GetArgs<K>): _Api.Request.Config {
    const { method, endpoint, body, config } = this.#resolveFetchArgs(args);

    const url = this.baseUrl.clone();
    url.endpoint = endpoint;

    const { headers, params, callback } = this.defaults.merge({ ...config, headers: config?.headers ?? {} });
    return Object.freeze({ method, url, body, headers, params, callback });
  }

  #resolveFetchArgs<T extends Http.Methods>(args: _Api.Fetch.GetArgs<T>) {
    const [method, endpoint, args2, args3] = args;

    const hasBody = ["POST", "PATCH", "PUT"].includes(method);
    const [config, body] = (hasBody ? [args3, args2] : [args2]) as [_Api.Fetch.Config?, _Api.Request.Body?];

    return Object.freeze({ method, endpoint, body, config });
  }

  clone(): Api {
    const api = new Api(this.baseUrl.href, this.#hookManager, this.#eventEmitter);

    api.defaults.headers = this.defaults.headers ? deepClone(this.defaults.headers) : undefined;
    api.defaults.params = this.defaults.params ? deepClone(this.defaults.params) : undefined;
    api.defaults.callback = this.defaults.callback;
    api.defaults.name = this.defaults.name;

    this.#eventEmitter.emit("clone", api);
    return api;
  }
}
