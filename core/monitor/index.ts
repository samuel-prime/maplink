import { MaplinkModule } from "core/maplink/module";
import type { ModulePrivilegedScope } from "core/maplink/scope";
import type { _SDK } from "core/maplink/types";
import type { _Api } from "lib/api/types";
import { ServerEvent } from "lib/server/event";
import type { HttpRequest } from "lib/server/request";
import type { HttpResponse } from "lib/server/response";
import type { _HttpServer } from "lib/server/types";
import assert from "node:assert";
import { FetchEvent } from "./fetch-event";
import { MonitorPage } from "./html";
import { EventCard } from "./html/event-card";

export class Monitor extends MaplinkModule<ModulePrivilegedScope> {
  static readonly METADATA: _SDK.Module.Metadata = {
    name: "monitor",
    version: "0.0.1",
    description: "Handles monitoring fetch events.",
  };

  static readonly SPOIL_TIME = 2 * 60 * 60 * 1000; // 2 hours

  readonly #intervalId?: NodeJS.Timeout;
  #events: FetchEvent<unknown, unknown>[] = [];

  constructor(scope: ModulePrivilegedScope) {
    super(scope, Monitor.METADATA);
    this.logger.prefix = "[MONITOR]";

    if (this.server) {
      this.server.get("/fetch-stream/html", this.#createHtmlFetchStreamRoute());
      this.server.get("/fetch-stream", this.#createFetchStreamRoute());
      this.server.get("/monitor", this.#createMonitorRoute());

      this.#intervalId = setInterval(
        () => (this.#events = this.#events.filter((e) => Date.now() - e.data.timestamp.getTime() < Monitor.SPOIL_TIME)),
        Monitor.SPOIL_TIME,
      );

      this.server.onClose(() => clearInterval(this.#intervalId));
    }
  }

  #createFetchStreamRoute(): _HttpServer.RouteHandler {
    return async (_req: HttpRequest, res: HttpResponse) => {
      const listener: _Api.Events.Listener<"fetchEnd"> = async (fetch) => {
        const event = await FetchEvent.create(fetch);
        this.#events.push(event);
        res.push(event);
      };

      res.onClose(() => this.api.removeListener("fetchEnd", listener));
      this.api.on("fetchEnd", listener);
    };
  }

  #createHtmlFetchStreamRoute(): _HttpServer.RouteHandler {
    return async (_req: HttpRequest, res: HttpResponse) => {
      const listener: _Api.Events.Listener<"fetchEnd"> = async (fetch) => {
        const event = await FetchEvent.create(fetch);
        this.#events.push(event);
        const card = EventCard(event).replaceAll("\n", "");
        res.push(new ServerEvent(event.id, event.name, card));
      };

      res.onClose(() => this.api.removeListener("fetchEnd", listener));
      this.api.on("fetchEnd", listener);
    };
  }

  #createMonitorRoute(): _HttpServer.RouteHandler {
    const { url } = this.server ?? {};
    assert(url, "The server URL is required to create the monitor route");

    return async (_req: HttpRequest, res: HttpResponse) => {
      res.setHeader("content-type", "text/html");
      res.send(
        MonitorPage({
          url: new URL("/fetch-stream/html", url).pathname,
          children: this.#events
            .toReversed()
            .map((e) => EventCard(e))
            .join("\n"),
        }),
      );
    };
  }
}
