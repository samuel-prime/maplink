import assert from "node:assert";
import { deepClone } from "utils/deep-clone";
import type { Prototype } from "utils/types";
import { Api } from ".";
import type { _Api, _Http } from "./types";
import type { Url } from "./url";

/**
 * Represents an API request object.
 */
export class ApiRequest implements Prototype<ApiRequest> {
  readonly fetchId: string;
  readonly method: _Http.Methods;
  readonly url: Url;
  readonly body: _Api.RequestBody;
  readonly headers: _Http.Headers;
  readonly #params: _Api.RequestParams;

  constructor(method: _Http.Methods, url: Url, body: _Api.RequestBody, config: _Api.RequestConfig) {
    const VALID_METHODS: _Http.Methods[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    assert(VALID_METHODS.includes(method), `Invalid method: ${method}`);

    this.fetchId = Api.getContext().id;
    this.method = method;
    this.body = body;
    this.headers = config.headers ?? {};
    this.#params = config.params ?? {};
    this.url = url.clone(undefined, this.#params);
  }

  /**
   * Returns a copy of the request parameters.
   */
  get params(): _Api.RequestParams {
    return { ...this.#params };
  }

  /**
   * Sets a new request parameter and updates the URL accordingly.
   */
  set params([key, value]: [string, string | number | boolean]) {
    this.#params[key] = String(value);
    this.url.parameters = this.#params;
  }

  /**
   * Converts the request body to a JSON string if it's an object.
   * Throws an error if the body is not a valid `_Api.RequestBody` type.
   */
  get payload() {
    return typeof this.body === "string" ? this.body : JSON.stringify(this.body);
  }

  /**
   * Creates a deep clone of the current instance, ensuring that object properties are deeply cloned to avoid reference issues.
   */
  clone(): ApiRequest {
    return new ApiRequest(
      this.method,
      this.url,
      this.body instanceof Object ? deepClone(this.body) : this.body,
      deepClone({ headers: this.headers, params: this.params }),
    );
  }
}
