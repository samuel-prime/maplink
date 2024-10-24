import { MaplinkModule } from "core/maplink/module";
import type { MaplinkApi, Module } from "core/maplink/types";
import assert from "node:assert";
import type { Either, Failure, FilterKeys } from "utils/types";
import type { _Geocode } from "./types";

/**
 * ### Geocode API
 *
 * The Geocode Autocomplete API is a Restful API capable of returning coordinates
 * (latitude and longitude) from an address or vice versa.
 *
 * With the Geocode Autocomplete API you can:
 *
 * - Obtain coordinates and geographic data from an address, or part of it;
 * - Obtain information about an address from its coordinates;
 * - Autocomplete and normalize addresses with suggestions based on user input;
 * - Filter results based on specific parameters, such as location type, country, etc.
 *
 * For more information about the Geocode API, see the [official documentation](https://developers.maplink.global/introducao-geocode/).
 */
export class Geocode extends MaplinkModule {
  static readonly #ENDPOINT = "/geocode/v1";

  constructor(scope: Module.Scope) {
    super(scope, {
      name: "geocode",
      version: "1.0.0",
      description: "Handles geocoding operations.",
    });

    this.api.baseUrl.endpoint = Geocode.#ENDPOINT;
    this.logger.prefix = "[GEOCODE]";
    this.globalSearch = false;
  }

  // Public Methods --------------------------------------------------------------------------------

  /**
   * Search for addresses based on partial address information. The search can be performed using:
   *
   * - A `string`, in URL query format. It uses the `suggestion` mode;
   * - An `object` in the `SearchAddress` interface. It uses the `default` mode;
   * - An `array` of `SearchAddress` objects. It uses the `multiDefault` mode.
   *
   * @remarks The `multiDefault` mode requires to pass an `id` property in each object, which
   * will be used to identify the results.
   */
  async search<T extends _Geocode.ModeInput<"suggestion" | "default" | "multiDefault">>(input: T) {
    return typeof input === "string"
      ? this.#searchByParams("/suggestions", input)
      : this.#searchByBody(Array.isArray(input) ? "/multi-geocode" : "/geocode", input);
  }

  /**
   * Search for addresses based on given coordinates.
   * Depending on the number of coordinates, the search will be performed using:
   *
   * - For 1 coordinate, an `object` in the `Coordinates` interface. It uses the `reverse` mode;
   * - For multiple coordinates, an `array` of `Coordinates` objects. It uses the `multiReverse` mode.
   *
   * @remarks
   * The `multiReverse` mode requires to pass an `id` property in each object, which will be used to identify the results.
   * This mode also returns the `extended` version of the `Address` interface.
   */
  async reverseSearch<T extends _Geocode.ModeInput<"reverse" | "multiReverse">>(input: T) {
    return this.#searchByBody("/reverse", input);
  }

  // Getters and Setters ---------------------------------------------------------------------------

  /**
   * Enables or disables the global search.
   * When enabled, the search can be performed outside of Brazil.
   */
  set globalSearch(value: boolean) {
    assert(typeof value === "boolean", "The global search must be a boolean.");
    this.api.param = ["globalSearch", value];
    this.logger.info(`Global search is ${value ? "enabled" : "disabled"}.`);
  }

  // Private Methods -------------------------------------------------------------------------------

  async #searchByBody<
    T extends _Geocode.ModeInput<FilterKeys<_Geocode.SearchModes, [object, any]>>,
    U = _Geocode.SelectModeOutput<T>,
  >(endpoint: string, input: T): Promise<Either<U, Error>> {
    const { kind, value } = await this.api.post<U, MaplinkApi.DefaultErrorResponse>(
      endpoint,
      input,
    );
    return kind === "failure" ? this.#handleError(value) : { kind: "success", value };
  }

  async #searchByParams<
    T extends _Geocode.ModeInput<FilterKeys<_Geocode.SearchModes, [string, any]>>,
    U = _Geocode.SelectModeOutput<T>,
  >(endpoint: string, input: T): Promise<Either<U, Error>> {
    const { kind, value } = await this.api.get<U, MaplinkApi.DefaultErrorResponse>(endpoint, {
      params: { q: input },
    });
    return kind === "failure" ? this.#handleError(value) : { kind: "success", value };
  }

  #handleError(value: Error | MaplinkApi.DefaultErrorResponse): Failure<Error> {
    return { kind: "failure", value: value instanceof Error ? value : new Error(value.title) };
  }
}
