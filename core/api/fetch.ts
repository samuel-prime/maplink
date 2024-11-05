import { Api } from ".";
import { ApiRequest } from "./request";
import { ApiResponse } from "./response";

export class ApiFetch<T, E> {
  readonly id = Api.getContext().fetchId;
  readonly request = new ApiRequest();
  readonly response = this.#execute();

  constructor(readonly name?: string) {
    this.response.then(async () => {
      const { hooks } = Api.getContext();
      await Promise.allSettled(hooks.afterFetch.map((hook) => hook.execute(this)));
    });
  }

  async #execute(): Promise<ApiResponse<T, E>> {
    const { emitter, hooks } = Api.getContext();

    await Promise.allSettled(hooks.beforeFetch.map((hook) => hook.execute(this)));
    const { url, method, headers, payload: body } = this.request;

    const promise = ApiResponse.fromFetch<T, E>(fetch(url, { method, headers, body }));
    emitter("request", this.request.clone());

    const response = await promise;
    response.request = this.request.clone();
    emitter("response", response.clone());

    return response;
  }
}
