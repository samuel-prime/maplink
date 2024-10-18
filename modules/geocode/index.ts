import type { Api } from "lib/api";
import type { Logger } from "lib/logger";
import assert from "node:assert";

/**
 * ### Geocode API
 *
 * The Geocode Autocomplete API is a Restful API capable of returning coordinates (latitude and longitude) from an address or vice versa.
 *
 * With the Geocode Autocomplete API you can:
 *
 * - Obtain coordinates and geographic data from an address, or part of it;
 * - Obtain information about an address from its coordinates;
 * - Autocomplete and normalize addresses with suggestions based on user input;
 * - Filter results based on specific parameters, such as location type, country, etc.
 *
 * **For more information about the Geocode API, see the [official documentation](https://developers.maplink.global/introducao-geocode/).**
 *
 * @returns {Geocode} An instance of the `Geocode` module class.
 */
export class Geocode {
  static readonly #ENDPOINT = "/geocode/v1";

  readonly #api: Api;
  readonly #logger: Logger;
  readonly #loggerName = `[${this.constructor.name.toUpperCase()}]`;

  constructor(scope: MaplinkModuleScope) {
    this.#api = scope.api;
    this.#logger = scope.logger;

    this.#api.baseUrl.endpoint = Geocode.#ENDPOINT;
    this.globalSearch = false;
  }

  // Public Methods --------------------------------------------------------------------------------

  /**
   * Search for addresses based on partial address information.
   * The search can be performed using:
   *
   * - A `string`, in URL query format. -- it uses the `suggestion` mode;
   * - An `object` in the `SearchAddress` interface. -- it uses the `default` mode;
   * - An `array` of `SearchAddress` objects. -- it uses the `multiDefault` mode.
   *
   * @remarks The `multiDefault` mode requires to pass an `id` property in each object, which will be used to identify the results.
   */
  async search<T extends Geocode.ModeInput<"suggestion" | "default" | "multiDefault">>(input: T) {
    return typeof input === "string"
      ? this.#searchByParams("/suggestions", input)
      : this.#searchByBody(Array.isArray(input) ? "/multi-geocode" : "/geocode", input);
  }

  /**
   * Search for addresses based on given coordinates.
   * Depending on the number of coordinates, the search will be performed using:
   *
   * - For 1 coordinate, an `object` in the `Coordinates` interface. -- it uses the `reverse` mode;
   * - For multiple coordinates, an `array` of `Coordinates` objects. -- it uses the `multiReverse` mode.
   *
   * @remarks
   * The `multiReverse` mode requires to pass an `id` property in each object, which will be used to identify the results.
   * This mode also returns the `extended` version of the `Address` interface.
   */
  async reverseSearch<T extends Geocode.ModeInput<"reverse" | "multiReverse">>(input: T) {
    return this.#searchByBody("/reverse", input);
  }

  // Getters and Setters ---------------------------------------------------------------------------

  /**
   * Enables or disables the global search.
   * When enabled, the search can be performed outside of Brazil.
   */
  set globalSearch(value: boolean) {
    assert(typeof value === "boolean", "The global search must be a boolean.");
    this.#api.param = ["globalSearch", value];
    this.#logger.info(this.#loggerName, `Global search is ${value ? "enabled" : "disabled"}.`);
  }

  // Private Methods -------------------------------------------------------------------------------

  async #searchByBody<
    T extends Geocode.ModeInput<FilterKeys<Geocode.SearchModes, [object, any]>>,
    U = Geocode.SelectModeOutput<T>,
  >(endpoint: string, input: T): Promise<Either<U, Error>> {
    const { kind, value } = await this.#api.post<U, MaplinkErrorResponse>(endpoint, input);
    return kind === "failure" ? this.#handleError(value) : { kind: "success", value };
  }

  async #searchByParams<
    T extends Geocode.ModeInput<FilterKeys<Geocode.SearchModes, [string, any]>>,
    U = Geocode.SelectModeOutput<T>,
  >(endpoint: string, input: T): Promise<Either<U, Error>> {
    const { kind, value } = await this.#api.get<U, MaplinkErrorResponse>(endpoint, { params: { q: input } });
    return kind === "failure" ? this.#handleError(value) : { kind: "success", value };
  }

  #handleError(value: Error | MaplinkErrorResponse): Failure<Error> {
    return { kind: "failure", value: value instanceof Error ? value : new Error(value.title) };
  }
}
