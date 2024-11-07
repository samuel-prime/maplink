import type { ServerResponse } from "node:http";
import { isObject } from "utils/isObject";

export class HttpResponse {
  readonly #response: ServerResponse;

  constructor(response: ServerResponse) {
    this.#response = response;
  }

  status(statusCode: number) {
    this.#response.statusCode = statusCode;
    return this;
  }

  setHeader(name: string, value: string | number) {
    this.#response.setHeader(String(name), value);
    return this;
  }

  send(body?: string | object) {
    if (!body) return this.#response.end();

    const data = this.#parseBody(body);
    this.setHeader("content-length", Buffer.byteLength(data));
    this.setHeader("content-type", isObject(body) ? "application/json" : "text/plain");

    this.#response.end(data);
  }

  #parseBody(body?: string | object) {
    if (typeof body === "string") return body;
    return JSON.stringify(body);
  }
}
