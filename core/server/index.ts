import { MaplinkModule } from "core/maplink/module";
import type { ModulePrivilegedScope } from "core/maplink/scope";
import type { _SDK } from "core/maplink/types";
import assert from "node:assert";
import { createServer, type Server } from "node:http";
import { Failure, Success } from "utils/either";
import type { Either } from "utils/types";
import { HttpRequest } from "./request";
import { HttpResponse } from "./response";
import { Route } from "./route";
import type { _HttpServer } from "./types";

export class HttpServer extends MaplinkModule<ModulePrivilegedScope> {
  static readonly METADATA: _SDK.Module.Metadata = {
    name: "server",
    version: "0.0.1",
    description: "Handles webhook callbacks.",
  };

  readonly #config: _HttpServer.Config;
  readonly #routes: Route[] = [];
  #server?: Server;

  constructor(scope: ModulePrivilegedScope) {
    assert(scope.config.serverPort, "The server port must be provided.");
    super(scope, HttpServer.METADATA);

    this.#config = { port: scope.config.serverPort };
    this.logger.prefix = "[SERVER]";
  }

  get(endpoint: string, handler: _HttpServer.RouteHandler) {
    this.#routes.push(new Route("GET", endpoint, handler));
  }

  post(endpoint: string, handler: _HttpServer.RouteHandler) {
    this.#routes.push(new Route("POST", endpoint, handler));
  }

  run(): Either<string, string> {
    try {
      this.#server = createServer(async (req, res) => {
        const response = new HttpResponse(res);
        const request = new HttpRequest(req);

        const { method, endpoint } = request;
        if (!method || !["GET", "POST"].includes(method)) return response.status(405).send();

        for (const route of this.#routes) {
          if (route.match(method, endpoint)) {
            const data = await route.handler(request, response);
            return data ? response.send(data) : undefined;
          }
        }

        response.status(404).send();
      });

      const url = `http://localhost:${this.#config.port}/`;
      this.#server.listen(this.#config.port, () => this.logger.info(`Server running at ${url}`));

      return new Success(url);
    } catch (error) {
      return new Failure((error as Error).message);
    }
  }

  close() {
    if (this.#server) {
      this.#server.close(() => this.logger.info("Server stopped."));
      this.#server.closeAllConnections();
    }
  }
}
