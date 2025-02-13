import { Api } from ".";
import { ApiRequest } from "./request";
import { ApiResponse } from "./response";

export class ApiFetch<T, E> {
  readonly timestamps = { start: 0, end: 0 };
  readonly id = Api.getContext().fetchId;
  readonly request = new ApiRequest();
  readonly response = this.#execute();
  name?: string;
  tag?: string;

  constructor(name?: string) {
    this.name = name;

    this.response.then(async () => {
      const { hooks, emitter } = Api.getContext();
      await Promise.allSettled(hooks.afterFetch.map((hook) => hook.execute(this)));
      emitter("fetchEnd", this);
    });
  }

  async #execute(): Promise<ApiResponse<T, E>> {
    const { emitter, hooks } = Api.getContext();
    emitter("fetchStart", this);

    await Promise.allSettled(hooks.beforeFetch.map((hook) => hook.execute(this)));
    const { url, method, headers, payload: body } = this.request;

    this.timestamps.start = Date.now();

    const promise = ApiResponse.fromFetch<T, E>(fetch(url, { method, headers, body }));
    emitter("request", this.request.clone());

    const response = await promise;
    response.request = this.request.clone();

    this.timestamps.end = Date.now();

    emitter("response", response.clone());
    return response;
  }

  getDuration() {
    return this.timestamps.end - this.timestamps.start;
  }
}
