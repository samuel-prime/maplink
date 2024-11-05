import assert from "node:assert";
import { deepClone } from "utils/deep-clone";
import { isObject } from "utils/isObject";
import type { Prototype } from "utils/types";
import { Api } from ".";
import type { _Api } from "./types";
import { Url } from "./url";

export class ApiRequest implements Prototype<ApiRequest>, _Api.Request.Config {
  readonly fetchId: string;
  readonly method: _Api.Request.Config["method"];
  readonly url: _Api.Request.Config["url"];
  #params: _Api.Request.Config["params"];
  #body: _Api.Request.Config["body"];
  #callback: _Api.Request.Config["callback"];
  readonly headers: _Api.Request.Config["headers"];

  constructor(config?: _Api.Request.Config & { fetchId: string }) {
    const requestConfig = config ?? this.#getFromAsyncContext();

    const { fetchId, method, url, params, body, callback, headers } = deepClone(requestConfig);
    assert(["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method), `Invalid HTTP method: ${method}.`);

    this.fetchId = fetchId;
    this.method = method;
    this.url = new Url(url);
    this.params = params;
    this.body = body;
    this.callback = callback;
    this.headers = headers;
  }

  #getFromAsyncContext() {
    const { fetchId, requestConfig } = Api.getContext();
    return { fetchId, ...requestConfig };
  }

  get params(): _Api.Request.Config["params"] {
    return this.#params;
  }

  set params(params: _Api.Request.Config["params"]) {
    assert(isObject(params) || params === undefined, "Invalid params type.");
    this.#params = params;
    this.url.params = this.#params;
  }

  get body(): _Api.Request.Config["body"] {
    return this.#body;
  }

  set body(body: _Api.Request.Config["body"]) {
    assert(isObject(body) || ["string", "number", "undefined"].includes(typeof body), "Invalid body type.");
    this.#body = body;
    this.#setCallbacktoBody();
  }

  get callback(): _Api.Request.Config["callback"] {
    return this.#callback;
  }

  set callback(callback: _Api.Request.Config["callback"]) {
    assert(isObject(callback) || callback === undefined, "Invalid callback type.");
    this.#callback = callback;
    this.#setCallbacktoBody();
  }

  #setCallbacktoBody() {
    if (isObject(this.body)) (this.body as any).callback = this.#callback;
  }

  get payload(): string {
    return typeof this.body === "string" ? this.body : JSON.stringify(this.body);
  }

  clone(): ApiRequest {
    const request = new ApiRequest(deepClone(this));
    request.callback = this.callback;
    request.params = this.params;
    request.body = this.body;
    return request;
  }
}
