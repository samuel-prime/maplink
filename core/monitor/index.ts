import { MaplinkModule } from "core/maplink/module";
import type { ModulePrivilegedScope } from "core/maplink/scope";
import type { _SDK } from "core/maplink/types";
import { ServerEvent } from "lib/server/event";
import type { HttpResponse } from "lib/server/response";
import { EventEmitter } from "node:stream";
import { FetchEvent } from "./fetch-event";
import { MonitorPage } from "./html";
import { EventCard } from "./html/event-card";
import { EventStatus } from "./html/event-status";

export class Monitor extends MaplinkModule<ModulePrivilegedScope> {
  static readonly METADATA: _SDK.Module.Metadata = {
    name: "monitor",
    version: "0.0.1",
    description: "Handles monitoring fetch events.",
  };

  static readonly SPOIL_TIME = 2 * 60 * 60 * 1000; // 2 hours

  readonly #intervalId?: NodeJS.Timeout;
  readonly #eventEmitter = new EventEmitter();
  #events: Array<{ event: FetchEvent<unknown, unknown>; status?: _SDK.Api.Event.Data }> = [];

  constructor(scope: ModulePrivilegedScope) {
    super(scope, Monitor.METADATA);
    this.logger.prefix = "[MONITOR]";

    this.api.on("fetchEnd", async (fetch) => {
      const event = await FetchEvent.create(fetch);
      this.#events.push({ event });
      this.#eventEmitter.emit("new_fetch", event);
    });

    this.#configureServerRoutes();

    this.#intervalId = setInterval(() => {
      this.#events = this.#events.filter(
        ({ event }) => Date.now() - event.data.timestamp.getTime() < Monitor.SPOIL_TIME,
      );
    }, Monitor.SPOIL_TIME);

    this.server.onClose(() => clearInterval(this.#intervalId));
  }

  #setListener(res: HttpResponse, event: string, listener: (...args: any[]) => Promise<void>) {
    res.onClose(() => this.#eventEmitter.removeListener(event, listener));
    this.#eventEmitter.on(event, listener);
  }

  #configureServerRoutes() {
    this.server.get("/monitor", async (_req, res) => {
      res.setHeader("content-type", "text/html");
      res.send(
        MonitorPage({
          children: this.#events
            .toReversed()
            .map(({ event, status }) => EventCard(event, status))
            .join("\n"),
        }),
      );
    });

    this.server.get("/fetch-stream", async (_req, res) => {
      this.#setListener(res, "new_fetch", async (event: FetchEvent<any, any>) => res.push(event));
    });

    this.server.get("/fetch-stream/html", async (_req, res) => {
      this.#setListener(res, "new_fetch", async (event: FetchEvent<any, any>) => {
        const card = EventCard(event).replaceAll("\n", "");
        res.push(new ServerEvent(event.id, event.name, card));
      });
    });

    this.server.get("/fetch-stream/callback", async (_req, res) => {
      this.#setListener(res, "callback", async (event: _SDK.Api.Event.Data) => {
        res.push(new ServerEvent(event.id, event.jobId, event));
        if (event.description === "TERMINATE") res.close();
      });
    });

    this.server.get("/fetch-stream/callback/html", async (_req, res) => {
      this.#setListener(res, "callback", async (event: _SDK.Api.Event.Data) => {
        const card = EventStatus(event).replaceAll("\n", "");
        res.push(new ServerEvent(event.id, event.jobId, card));
        if (event.description === "TERMINATE") res.close();
      });
    });

    this.server.post("/", async (req, res) => {
      const { kind, value } = await req.data<_SDK.Api.Event.Data[]>();
      if (kind === "failure" || value.length === 0) return res.send();

      const [event] = value;
      const data = this.#events.find((d) => d.event.data.jobId === event.jobId);
      if (data) data.status = event;

      this.#eventEmitter.emit("callback", event);
    });
  }

  onCallback(listener: (event: _SDK.Api.Event.Data) => Promise<void> | void) {
    this.#eventEmitter.on("callback", listener);
  }

  removeCallbackListener(listener: (event: _SDK.Api.Event.Data) => Promise<void> | void) {
    this.#eventEmitter.removeListener("callback", listener);
  }
}
