import assert from "node:assert";
import type { Http } from "utils/types";
import type { _HttpServer } from "./types";

export class Route {
  readonly handler: _HttpServer.RouteHandler;
  readonly method: Http.Methods;
  readonly endpoint: string;
  readonly params: string[];

  constructor(method: Http.Methods, endpoint: string, handler: _HttpServer.RouteHandler) {
    assert(["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method), `Invalid HTTP method: ${method}.`);

    this.method = method;
    this.handler = handler;
    this.endpoint = endpoint;
    this.params = this.endpoint.match(/:[a-zA-Z0-9]+/g)?.map((p) => p.slice(1)) ?? [];
  }

  match(method = "", endpoint = "") {
    const pathParts = this.endpoint.split("/").map((p) => (p.startsWith(":") ? "([^/]+)" : p));
    const pattern = new RegExp(`^(${pathParts.join("/")})(\/?)$`);
    return method === this.method && pattern.test(endpoint);
  }
}
