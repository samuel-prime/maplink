import type { ApiFetch } from "lib/api/fetch";
import { ServerEvent } from "lib/server/event";
import type { FetchEventData } from "./types";

export class FetchEvent<T, E> extends ServerEvent<FetchEventData<T, E>> {
  private constructor(id: string, name: string, data: FetchEventData<T, E>) {
    super(id, name ?? "fetch", data);
  }

  static async create<T, E>(fetch: ApiFetch<T, E>) {
    const { id, name, request } = fetch;

    const response = await fetch.response;
    const { kind, value } = await response.data;
    const type = value instanceof Error ? "error" : kind;

    const data = {
      jobId: fetch.tag,
      timestamp: new Date(),
      duration: fetch.getDuration(),
      request: { method: request.method, url: request.url.href, body: request.body },
      response: { ok: response.ok, code: response.status, status: response.statusText, data: value, type },
    };

    return new FetchEvent(id, name ?? "fetch", data);
  }
}
