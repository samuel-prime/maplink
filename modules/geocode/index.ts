import { MaplinkModule } from "core/maplink/module";
import type { ModuleScope } from "core/maplink/scope";
import type { _SDK } from "core/maplink/types";
import assert from "node:assert";
import type { _Geocode } from "./types";

export class Geocode extends MaplinkModule {
  static readonly METADATA: _SDK.Module.Metadata = {
    name: "geocode",
    version: "0.0.1",
    description: "Handles geocoding operations.",
  };

  static readonly #ENDPOINT = "/geocode/v1";

  constructor(scope: ModuleScope) {
    super(scope, Geocode.METADATA);

    this.api.baseUrl.endpoint = Geocode.#ENDPOINT;
    this.api.defaults.name = "geocode";
    this.logger.prefix = "[GEOCODE]";
    this.globalSearch = false;
  }

  async search<T extends _Geocode.Search.Input, U = _Geocode.Search.SelectOutput<T>>(input: T) {
    const endpoint = this.#resolveEndpointByInput(input);

    return typeof input === "string"
      ? this.api.get<U, _SDK.Api.DefaultErrorResponse>(endpoint, { params: { q: input } })
      : this.api.post<U, _SDK.Api.DefaultErrorResponse>(endpoint, input);
  }

  #resolveEndpointByInput(input: _Geocode.Search.Input) {
    if (typeof input === "string") return "/suggestions";

    if (Array.isArray(input)) {
      assert(input.length, "The search array must not be empty.");
      const [sample] = input;

      const isCoord = Object.hasOwn(sample, "lat") && Object.hasOwn(sample, "lon");
      if (isCoord) return input.length > 1 ? "/multi-reverse" : "/reverse";

      return "/multi-geocode";
    }

    return "/geocode";
  }

  set globalSearch(value: boolean) {
    this.api.defaults.params = { globalSearch: !!value };
    this.logger.info(`Global search is ${value ? "enabled" : "disabled"}.`);
  }
}
