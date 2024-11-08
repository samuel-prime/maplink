import type { IncomingMessage } from "node:http";
import { Failure, Success } from "utils/either";
import type { Either } from "utils/types";

export class HttpRequest {
  readonly #incomingMessage: IncomingMessage;
  #rawData: Promise<Buffer>;

  constructor(incomingMessage: IncomingMessage) {
    this.#incomingMessage = incomingMessage;

    this.#rawData = new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      incomingMessage.on("data", (chunk: Buffer) => chunks.push(chunk));
      incomingMessage.on("end", () => resolve(Buffer.concat(chunks)));
      incomingMessage.on("error", (error) => reject(error));
    });
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
