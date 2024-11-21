import { MaplinkModule } from "core/maplink/module";
import type { ModuleScope } from "core/maplink/scope";
import type { _SDK } from "core/maplink/types";
import type { Either } from "utils/types";
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

    this.api.baseUrl.endpoint = Planning.#ENDPOINT;
    this.api.defaults.name = "planning";
    this.logger.prefix = "[PLANNING]";
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
  >(
    problem: PlanningProblem<LP, LC, VT, LZ, V, D, S, P>,
  ): Promise<Either<_Planning.Solution.Data, Error | _Planning.Api.Error>> {
    const result = await this.api.post<{ id: string }, _Planning.Api.Error>("/problems", problem, {
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

    if (result.kind === "failure") return result;

    return new Promise((resolve, reject) => {
      const listener = async (data: _SDK.Api.Event.Data) => {
        if (data.type === "STATUS_CHANGE" && data.description === "SOLVED" && data.jobId === result.value.id) {
          this.monitor.removeCallbackListener(listener);
          const solution = await this.solution(data.jobId);
          solution.kind === "failure" ? reject(solution) : resolve(solution);
        }
      };

      this.monitor.onCallback(listener);
    });
  }

  async problem<
    LP extends string,
    LC extends string,
    VT extends string,
    LZ extends string,
    V extends string,
    D extends string,
    S extends string,
    P extends string,
  >(
    problem: PlanningProblem<LP, LC, VT, LZ, V, D, S, P>,
  ): Promise<Either<{ id: string }, Error | _Planning.Api.Error>> {
    return this.api.post<{ id: string }, _Planning.Api.Error>("/problems", problem, {
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
    return this.api.get<_SDK.Api.Event.Data[], _Planning.Api.Error>("/events", { params: { jobId } });
  }

  async status(jobId: string) {
    return this.api.get<_SDK.Api.Event.Data, _Planning.Api.Error>(`/jobs/${jobId}`);
  }

  async solution(jobId: string) {
    return this.api.get<_Planning.Solution.Data, _Planning.Api.Error>(`/solutions/${jobId}`);
  }

  onUpdate(handler: (event: _SDK.Api.Event.Data, destroy: () => void) => Promise<void> | void) {
    const listener = async (data: _SDK.Api.Event.Data) => {
      handler(data, () => this.monitor.removeCallbackListener(listener));
    };

    this.monitor.onCallback(listener);
  }
}
