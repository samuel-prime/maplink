import { MaplinkModule } from "core/maplink/module";
import type { ModuleScope } from "core/maplink/scope";
import type { _SDK } from "core/maplink/types";
import type { PlanningProblem } from "./problem";
import type { _Planning } from "./types";

export class Planning extends MaplinkModule {
  static readonly METADATA: _SDK.Module.Metadata = {
    name: "planning",
    version: "0.0.1",
    description: "Handles the planning of routes and schedules for vehicles.",
  };

  static readonly #ENDPOINT = "/planning/v1";

  constructor(scope: ModuleScope) {
    super(scope, Planning.METADATA);

    this.api.defaults.callback = { url: this.server.url };
    this.api.baseUrl.endpoint = Planning.#ENDPOINT;
    this.api.defaults.name = "planning";
    this.logger.prefix = "[PLANNING]";

    this.api.afterFetch<{ id: string }, Error>(async (fetch) => {
      const response = await fetch.response;
      const { kind, value } = await response.data;
      if (kind === "success") fetch.tag = value.id;
    });
  }

  async create<
    LP extends string,
    LC extends string,
    VT extends string,
    LZ extends string,
    V extends string,
    D extends string,
    S extends string,
    P extends string,
  >(problem: PlanningProblem<LP, LC, VT, LZ, V, D, S, P>) {
    return this.api.post<{ id: string }, _Planning.Api.Error>("/problems", problem);
  }

  async events(jobId: string) {
    return this.api.get<_SDK.Api.Event.Data[], _Planning.Api.Error>("/events", { params: { jobId } });
  }

  async status(jobId: string) {
    return this.api.get<_SDK.Api.Event.Data, _Planning.Api.Error>(`/jobs/${jobId}`);
  }

  async solution(jobId: string) {
    return this.api.get<_Planning.Solution.Data, _Planning.Api.Error>(`/solutions/${jobId}`);
  }
}
