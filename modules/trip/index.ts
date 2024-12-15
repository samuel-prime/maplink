import { MaplinkModule } from "core/maplink/module";
import type { ModuleScope } from "core/maplink/scope";
import type { _SDK } from "core/maplink/types";
import type { _Trip } from "./types";

export class Trip extends MaplinkModule {
  static readonly METADATA: _SDK.Module.Metadata = {
    name: "trip",
    version: "0.0.1",
    description: "Handles the route calculation process.",
  };

  static readonly #ENDPOINT = "/trip";

  constructor(scope: ModuleScope) {
    super(scope, Trip.METADATA);

    this.api.baseUrl.endpoint = Trip.#ENDPOINT;
    this.api.defaults.name = "trip";
    this.api.defaults.headers = { "content-type": "application/json" };
    this.logger.prefix = "[TRIP]";
  }

  async calculate<T extends _Trip.PointsMode>(request: _Trip.Request, pointsMode: T) {
    return this.api.post<_Trip.Response<T>, _SDK.Api.DefaultErrorResponse>("v2/calculations", request, {
      params: { pointsMode },
      hooks: {
        afterFetch: [
          async (fetch) => {
            const response = await fetch.response;
            const { kind, value } = await response.data;
            if (kind === "success") fetch.tag = value.id;
          },
        ],
      },
    });
  }

  async create(request: _Trip.Request) {
    return this.api.post<{ id: string }, _SDK.Api.DefaultErrorResponse>("v1/problems", request, {
      callback: { url: this.server.url },
      hooks: {
        afterFetch: [
          async (fetch) => {
            const response = await fetch.response;
            const { kind, value } = await response.data;
            if (kind === "success") fetch.tag = value.id;
          },
        ],
      },
    });
  }

  async events(jobId: string) {
    return this.api.get<_SDK.Api.Event.Data[], _SDK.Api.DefaultErrorResponse>("v1/events", { params: { jobId } });
  }

  async status(jobId: string) {
    return this.api.get<_SDK.Api.Event.Data, _SDK.Api.DefaultErrorResponse>(`v1/jobs/${jobId}`);
  }

  async solution<T extends _Trip.PointsMode>(jobId: string, pointsMode: T) {
    return this.api.get<_Trip.Response<T>, _SDK.Api.DefaultErrorResponse>(`v1/solutions/${jobId}`, {
      params: { pointsMode },
    });
  }

  onUpdate(handler: (event: _SDK.Api.Event.Data, destroy: () => void) => Promise<void> | void) {
    const listener = async (data: _SDK.Api.Event.Data) => {
      handler(data, () => this.monitor.removeCallbackListener(listener));
    };

    this.monitor.onCallback(listener);
  }
}
