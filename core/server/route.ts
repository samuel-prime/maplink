import type { _Http } from "core/http/types";
import type { _HttpServer } from "./types";

export class Route {
  constructor(
    readonly method: _Http.Methods,
    readonly endpoint: string,
    readonly handler: _HttpServer.RouteHandler,
  ) {}

  match(method = "", endpoint = "") {
    const regex = new RegExp(this.endpoint);
    return method === this.method && regex.test(endpoint);
  }
}
