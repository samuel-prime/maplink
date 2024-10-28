import { Api } from ".";
import { ApiRequest } from "./request";
import { ApiResponse } from "./response";
import type { _Api, _Http } from "./types";
import type { Url } from "./url";

/**
 * Represents an API fetch operation, encapsulating both the request and response objects.
 */
export class ApiFetch<T, E> {
  readonly request: ApiRequest;
  readonly response: Promise<ApiResponse<T, E>>;

  constructor(method: _Http.Methods, url: Url, body: _Api.RequestBody, config: _Api.RequestConfig) {
    this.request = new ApiRequest(method, url, body, config);
    this.response = this.#execute();
  }

  // Executes the fetch operation within the given API context.
  // Manages the request/response hooks and triggers events for the request and response objects.
  async #execute() {
    const context = Api.getContext();

    await Promise.allSettled(context.requestHooks.map((hook) => hook(this.request)));
    const { url, method, headers, payload: body } = this.request;

    const promise = ApiResponse.fromFetch<T, E>(fetch(url, { method, headers, body }));
    context.emitEvent("request", this.request.clone());

    const response = await promise;
    context.emitEvent("response", response.clone());

    await Promise.allSettled(context.responseHooks.map((hook) => hook(response)));
    return response;
  }
}
