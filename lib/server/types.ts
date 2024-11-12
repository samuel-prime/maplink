import type { HttpRequest } from "./request";
import type { HttpResponse } from "./response";

export namespace _HttpServer {
  export interface Config {
    readonly port: number;
  }

  export type RouteHandler<T = unknown> = (request: HttpRequest, response: HttpResponse) => Promise<T>;
}
