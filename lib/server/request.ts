import type { IncomingMessage } from "node:http";
import { Failure, Success } from "utils/either";
import type { Either } from "utils/types";
import type { Route } from "./route";

export class HttpRequest {
  readonly params: Record<string, string> = {};
  readonly #incomingMessage: IncomingMessage;
  #rawData: Promise<Buffer>;
  #route?: Route;

  constructor(incomingMessage: IncomingMessage) {
    this.#incomingMessage = incomingMessage;

    this.#rawData = new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      incomingMessage.on("data", (chunk: Buffer) => chunks.push(chunk));
      incomingMessage.on("end", () => resolve(Buffer.concat(chunks)));
      incomingMessage.on("error", (error) => reject(error));
    });
  }

  set route(route: Route) {
    this.#route = route;

    const keys = route.endpoint?.split("/") ?? [];
    const values = this.endpoint?.replaceAll(/\?.*$/g, "").split("/") ?? [];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (route.params.includes(key)) {
        this.params[key] = values[i];
      }
    }
  }

  get method() {
    return this.#incomingMessage.method;
  }

  get endpoint() {
    return this.#incomingMessage.url;
  }

  get headers() {
    return this.#incomingMessage.headers;
  }

  async data<T>(): Promise<Either<T, Error>> {
    const isJson = this.headers["content-type"]?.includes("application/json");

    try {
      const data = (await this.#rawData).toString();
      return new Success((isJson ? JSON.parse(data) : data) as T);
    } catch (error) {
      return new Failure(error as Error);
    }
  }
}
