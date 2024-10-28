import { Failure, Success } from "utils/either";
import type { Either, Prototype } from "utils/types";
import { Api } from ".";
import type { _Http } from "./types";

/**
 * Represents an API response object.
 * It can return either a `Success` or `Failure`, with type `T` or `E` respectively, based on the response status.
 */
export class ApiResponse<T, E> implements Prototype<ApiResponse<T, E>> {
  readonly fetchId: string;
  readonly ok: boolean;
  readonly status: number;
  readonly headers: _Http.Headers = {};
  readonly #originalResponse: Response;
  #data?: Either<T, E | Error>;

  constructor(response: Response) {
    this.fetchId = Api.getContext().id;
    this.ok = response.ok;
    this.status = response.status;
    this.#originalResponse = response;

    response.headers.forEach((value, key) => (this.headers[key] = value));
  }

  /**
   * Creates a new `ApiResponse` instance from a `fetch` promise.
   */
  static async fromFetch<T, E>(promise: Promise<Response>) {
    const response = await promise;
    return new ApiResponse<T, E>(response);
  }

  /**
   * Parses the response body and returns either a `Success` or `Failure` instance based on the response status.
   * **Currently, it only supports the `application/json` content-type.**
   */
  async data(): Promise<Either<T, E | Error>> {
    if (this.#data) return this.#data;

    const contentType = this.headers["content-type"];
    const error = new Error(contentType ? "Unsupported content-type." : "No content-type header.");

    let data: Either<T, E | Error> = new Failure(error);
    if (!contentType) return data;

    if (contentType.includes("application/json")) {
      try {
        const jsonObject = await this.#originalResponse.json();
        data = this.ok ? new Success(jsonObject as T) : new Failure(jsonObject as E);
      } catch (error) {
        data = new Failure(new Error("Failed to parse the response: Invalid JSON format."));
      }
    }

    return data;
  }

  /**
   * Creates a deep clone of the current instance, ensuring that object properties are deeply cloned to avoid reference issues.
   */
  clone(): ApiResponse<T, E> {
    return new ApiResponse(this.#originalResponse);
  }
}
