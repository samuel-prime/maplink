import assert from "node:assert";
import { createServer, type Server } from "node:http";
import { Failure, Success } from "utils/either";
import type { Either } from "utils/types";
import { HttpRequest } from "./request";
import { HttpResponse } from "./response";
import { Route } from "./route";
import type { _HttpServer } from "./types";

export class HttpServer {
  readonly #config: _HttpServer.Config;
  readonly #routes: Route[] = [];
  #server?: Server;

  constructor(config: _HttpServer.Config) {
    assert(config?.port, "Invalid port number.");
    this.#config = config;
  }

  get url() {
    return this.#config.publicUrl;
  }

  get(endpoint: string, handler: _HttpServer.RouteHandler) {
    this.#routes.push(new Route("GET", endpoint, handler));
  }

  post(endpoint: string, handler: _HttpServer.RouteHandler) {
    this.#routes.push(new Route("POST", endpoint, handler));
  }

  put(endpoint: string, handler: _HttpServer.RouteHandler) {
    this.#routes.push(new Route("PUT", endpoint, handler));
  }

  patch(endpoint: string, handler: _HttpServer.RouteHandler) {
    this.#routes.push(new Route("PATCH", endpoint, handler));
  }

  delete(endpoint: string, handler: _HttpServer.RouteHandler) {
    this.#routes.push(new Route("DELETE", endpoint, handler));
  }

  run(callback?: (url?: string) => void): Either<string, string> {
    try {
      this.#server = createServer(async (req, res) => {
        const response = new HttpResponse(res);
        const request = new HttpRequest(req);

        const { method, endpoint } = request;
        if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method ?? "")) return response.status(405).send();

        for (const route of this.#routes) {
          if (route.match(method, endpoint)) {
            request.route = route;
            const data = await route.handler(request, response);
            return data ? response.send(data) : undefined;
          }
        }

        response.status(404).send();
      });

      this.#server.listen(this.#config.port, () => (callback ? callback(this.#config.publicUrl) : undefined));
      return new Success(this.#config.publicUrl);
    } catch (error) {
      return new Failure((error as Error).message);
    }
  }

  close(callback?: () => void) {
    if (this.#server) {
      this.#server.close(callback);
      this.#server.closeAllConnections();
    }
  }

  onClose(callback: () => void) {
    this.#server?.on("close", callback);
  }
}
