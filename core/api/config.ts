import type { _Http } from "core/http/types";
import assert from "node:assert";
import { deepClone } from "utils/deep-clone";
import { deepMerge } from "utils/deep-merge";
import { isObject } from "utils/isObject";
import type { _Api } from "./types";
import { Url } from "./url";

export class ApiConfig implements _Api.Config {
  readonly #baseUrl: Url;
  readonly #defaults = new ApiDefaults();

  constructor(pathname: string) {
    this.#baseUrl = new Url(pathname);
  }

  get baseUrl() {
    return this.#baseUrl;
  }

  get defaults() {
    return this.#defaults;
  }
}

export class ApiDefaults implements _Api.Defaults {
  #callback?: _Api.Request.Callback;
  #params?: _Api.Request.Params;
  #headers?: _Http.Headers;
  #name?: string;

  constructor(defaults?: _Api.Defaults) {
    if (defaults) {
      this.#callback = defaults.callback;
      this.#headers = defaults.headers;
      this.#params = defaults.params;
      this.#name = defaults.name;
    }
  }

  get name(): _Api.Defaults["name"] {
    return this.#name;
  }

  set name(name: _Api.Defaults["name"]) {
    assert(typeof name === "string" || name === undefined, "The name must be a string or undefined.");
    this.#name = name;
  }

  get headers(): _Api.Defaults["headers"] {
    return this.#headers;
  }

  set headers(headers: _Api.Defaults["headers"]) {
    assert(isObject(headers) || headers === undefined, "The headers must be an object or undefined.");
    this.#headers = headers;
  }

  get params(): _Api.Defaults["params"] {
    return this.#params;
  }

  set params(params: _Api.Defaults["params"]) {
    assert(isObject(params) || params === undefined, "The params must be an object or undefined.");
    this.#params = params;
  }

  get callback(): _Api.Defaults["callback"] {
    return this.#callback;
  }

  set callback(callback: _Api.Defaults["callback"]) {
    assert(isObject(callback) || callback === undefined, "The callback must be an object or undefined.");
    this.#callback = callback;
  }

  merge(defaults: _Api.Defaults) {
    const headers = deepMerge(deepClone(this.headers ?? {}), deepClone(defaults.headers ?? {}));
    const params = deepMerge(deepClone(this.params ?? {}), deepClone(defaults.params ?? {}));
    const callback = defaults.callback ?? this.callback;
    return Object.freeze({ params, headers, callback });
  }
}
