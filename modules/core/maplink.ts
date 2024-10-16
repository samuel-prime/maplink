import { Api } from "lib/api";
import { Logger } from "lib/logger";
import { OAuth } from "./oauth";

export class Maplink {
  readonly #config: MaplinkConfig;
  readonly #api: Api;
  readonly #logger = new Logger();
  readonly #oauth: OAuth;

  constructor(config: MaplinkConfig) {
    if (!config.enableLogger) this.#logger.disable();

    this.#config = config;
    this.#api = new Api(config.url);
    this.#oauth = new OAuth(this.#api, this.#config, this.#logger);

    this.#oauth.appendApi(this.#api.clone());
    this.#oauth.setAuthorization();
  }
}
