import { Api } from "lib/api";
import { Logger } from "lib/logger";
import { Auth } from "modules/auth";

export class Maplink {
  readonly #config: MaplinkConfig;
  readonly #api: Api;
  readonly #logger = new Logger();
  readonly #auth: Auth;
  #isLocked = true;

  constructor(config: MaplinkConfig) {
    this.#config = config;
    this.#api = new Api(config.url);
    this.#auth = new Auth({ api: this.#api, logger: this.#logger }, this.#config);

    if (config.enableLogger !== true) this.#logger.disable();
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

  // Private Methods -------------------------------------------------------------------------------

  #createContext(): MaplinkModuleContext {
    return { api: this.#api.clone(), logger: this.#logger };
  }
}
