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

  setHeader(name: string, value: string | number | readonly string[]) {
    this.#response.setHeader(name, value);
    return this;
  }

  push(body?: string | object) {
    if (!this.#response.headersSent) {
      this.#response.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      });
    }

    this.#response.write(this.#parseBody(body));
  }

  send(body?: string | object) {
    if (!body) return this.#response.end();
    const data = this.#parseBody(body);

    this.setHeader("content-length", Buffer.byteLength(data));
    const hasContentType = this.#response.hasHeader("content-type");
    if (!hasContentType) this.setHeader("content-type", isObject(body) ? "application/json" : "text/plain");

    this.#response.end(data);
  }

  onClose(listener: () => void) {
    this.#response.on("close", listener);
  }

  #parseBody(body?: string | object) {
    if (typeof body === "string") return body;
    return JSON.stringify(body);
  }
}
