import type { ServerResponse } from "node:http";
import { isObject } from "utils/is-object";
import { stringify } from "utils/stringify";
import type { ServerEvent } from "./event";

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

  push(event: ServerEvent<any>) {
    if (!this.#response.headersSent) {
      this.#response.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      });
    }

    this.#response.write(event.toString());
  }

  send(body?: string | object) {
    if (!body) return this.#response.end();

    const data = stringify(body);
    this.setHeader("content-length", Buffer.byteLength(data));

    const hasContentType = this.#response.hasHeader("content-type");
    if (!hasContentType) this.setHeader("content-type", isObject(body) ? "application/json" : "text/plain");

    this.#response.end(data);
  }

  onClose(listener: () => void) {
    this.#response.on("close", listener);
  }

  close() {
    this.#response.end();
  }
}
