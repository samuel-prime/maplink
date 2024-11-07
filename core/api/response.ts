import type { _Http } from "core/http/types";
import assert from "node:assert";
import { Failure, Success } from "utils/either";
import type { Either, Prototype } from "utils/types";
import { Api } from ".";
import { ApiRequest } from "./request";
import type { _Api } from "./types";

export class ApiResponse<T = unknown, E = unknown> implements Prototype<ApiResponse<T, E>> {
  readonly fetchId: string;
  readonly #response: Response;
  #request?: ApiRequest;
  readonly ok: boolean;
  readonly status: number;
  readonly headers: _Http.Headers = {};
  readonly data: Promise<Either<T, E | Error>>;

  constructor(response: Response) {
    this.fetchId = Api.getContext().fetchId;
    this.#response = response;
    this.ok = response.ok;
    this.status = response.status;
    response.headers.forEach((value, key) => (this.headers[key] = value));
    this.data = this.#parseData();
  }

  static async fromFetch<T, E>(promise: Promise<Response>): Promise<ApiResponse<T, E>> {
    const response = await promise;
    return new ApiResponse<T, E>(response);
  }

  get request(): ApiRequest | undefined {
    return this.#request;
  }

  set request(request: ApiRequest) {
    assert(request instanceof ApiRequest, "Invalid request object.");
    this.#request = request;
  }

  async #parseData(): Promise<Either<T, E | Error>> {
    const contentType = this.#getContentType();
    if (!contentType) return new Failure(new Error("No content-type header."));

    if (contentType.includes("application/json")) return new JSONParser<T, E>(this.#response).parse();
    if (contentType.includes("text/")) return new TextParser<T, E>(this.#response).parse();

    return new Failure(new Error("Unsupported content-type."));
  }

  #getContentType() {
    for (const key in this.headers) {
      if (key.toLowerCase().includes("content-type")) return this.headers[key];
    }
  }

  clone(): ApiResponse<T, E> {
    const response = new ApiResponse<T, E>(this.#response);
    if (this.#request) response.request = this.#request.clone();
    return response;
  }
}

class JSONParser<T = unknown, E = unknown> implements _Api.Response.Parser<T, E> {
  constructor(readonly response: Response) {}

  async parse(): Promise<Either<T, E | Error>> {
    try {
      const data = await this.response.json();
      return this.response.ok ? new Success(data as T) : new Failure(data as E);
    } catch (error) {
      return new Failure(new Error("Failed to parse the response to object."));
    }
  }
}

class TextParser<T = unknown, E = unknown> implements _Api.Response.Parser<T, E> {
  constructor(readonly response: Response) {}

  async parse(): Promise<Either<T, E | Error>> {
    try {
      const data = await this.response.text();
      return this.response.ok ? new Success(data as T) : new Failure(data as E);
    } catch (error) {
      return new Failure(new Error("Failed to parse the response to text."));
    }
  }
}
