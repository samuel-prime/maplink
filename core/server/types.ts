import type { HttpRequest } from "./request";
import type { HttpResponse } from "./response";

export namespace _HttpServer {
  export interface Config {
    readonly port: number;
  }

  export type RouteHandler = (request: HttpRequest, response: HttpResponse) => Promise<any>;
}
