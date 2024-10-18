import { Api } from "lib/api";
import { Logger } from "lib/logger";
import { Auth } from "modules/auth";
import { Geocode } from "modules/geocode";
import assert from "node:assert";

/**
 * ### Maplink
 *
 * The `Maplink` class provides an interface to interact with various services from Maplink such as authentication and geocoding.
 * It initializes necessary modules and manages their lifecycle.
 *
 * @example
 * ```typescript
 * const config = {
 *   url: "https://api.maplink.global",
 *   clientId: "your-client-id",
 *   clientSecret: "your-client-secret",
 *   refreshTokenInterval: 45,
 *   enableLogger: true,
 * };
 *
 * const maplink = new Maplink(config);
 * await maplink.init();
 * const geocode = maplink.geocode;
 * ```
 *
 * @class
 * @param {MaplinkConfig} config - The configuration object for the Maplink instance.
 * @property {Auth} #auth - The authentication module instance.
 * @property {Geocode} #geocode - The geocode module instance.
 * @property {boolean} #isLocked - Indicates whether the instance is locked during initialization.
 * @property {Logger} #logger - The logger instance for logging operations.
 * @property {Api} #api - The API instance for making requests.
 */
export class Maplink {
  readonly #config: MaplinkConfig;
  readonly #api: Api;
  readonly #logger = new Logger();
  #isLocked = true;

  // Modules
  readonly #auth: Auth;
  readonly #geocode: Geocode;

  constructor(config: MaplinkConfig) {
    this.#config = config;
    this.#api = new Api(config.url);

    this.#auth = new Auth({ api: this.#api, logger: this.#logger }, this.#config);
    this.#geocode = new Geocode(this.#createScope());

    if (config.enableLogger !== true) this.#logger.enabled = false;
    if (config.initialize !== false) this.init();
  }

  // Public Methods --------------------------------------------------------------------------------

  /**
   * Initializes the Maplink instance by loading the necessary modules.
   * It keeps the modules **locked** until the initialization is complete.
   *
   * @returns {Promise<this>} A promise that resolves to the instance of the MapLink module.
   */
  async init() {
    await this.#auth.init();
    this.#isLocked = false;
    return this;
  }

  // Getters and Setters ---------------------------------------------------------------------------

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
  get geocode() {
    this.#checkLock();
    return this.#geocode;
  }

  // Private Methods -------------------------------------------------------------------------------

  #checkLock(): void {
    assert(
      !this.#isLocked,
      "The Maplink module is locked. Call the init method to unlock, or wait for it to complete.",
    );
  }

  #createScope(): MaplinkModuleScope {
    return { api: this.#api.clone(), logger: this.#logger };
  }
}
