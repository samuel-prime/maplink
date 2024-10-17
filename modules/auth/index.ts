import type { Api } from "lib/api";
import type { Logger } from "lib/logger";

/**
 * The `Auth` class handles the authentication process for the application.
 * It manages the bearer token, including refreshing it at regular intervals
 * and updating the token for all API instances in the update list.
 *
 * @class
 * @example
 * const auth = new Auth(context, config);
 * auth.init();
 */
export class Auth {
  static readonly #ENDPOINT = "/oauth/client_credential/accesstoken";
  static readonly #BASE_INTERVAL = 60 * 1000; // 1 minute

  readonly #credentials: string;
  readonly #intervalTime: number;
  readonly #api: Api;
  readonly #logger: Logger;
  readonly #loggerName = `[${this.constructor.name.toUpperCase()}]`;
  readonly #updateList: Api[] = [];
  #intervalId?: NodeJS.Timeout;
  #token?: string;
  #tokenExpiry?: number;

  constructor(ctx: MaplinkModuleContext, config: AuthConfig) {
    const { clientId: client_id, clientSecret: client_secret } = config;

    this.#credentials = new URLSearchParams({ client_id, client_secret }).toString();
    this.#intervalTime = config.refreshTokenInterval * Auth.#BASE_INTERVAL;
    this.#api = ctx.api;
    this.#logger = ctx.logger;

    this.#api.on("clone", (api) => this.appendApi(api));
  }

  // Public Methods --------------------------------------------------------------------------------

  /**
   * Initializes the authentication module.
   * This method updates the token and starts the refresh routine.
   */
  init() {
    this.refreshToken();
    this.#startTokenAutoRefresh();
  }

  /**
   * Appends an API instance to the update list.
   * APIs in this list will have their bearer token updated when a new token is generated.
   */
  appendApi(api: Api) {
    this.#updateList.push(api);
  }

  /**
   * Refreshes the bearer token.
   * If the token is not expired, it only updates the APIs in the update list.
   */
  async refreshToken() {
    if (this.#token && this.#tokenExpiry && Date.now() < this.#tokenExpiry) {
      this.#setTokenToApis(this.#token);
      return;
    }

    const { kind, value } = await this.#getToken();

    if (kind === "failure") {
      this.#logger.error(this.#loggerName, value.message);
      return;
    }

    this.#token = value;
    this.#tokenExpiry = Date.now() + this.#intervalTime;

    this.#setTokenToApis(value);
  }

  // Private Methods -------------------------------------------------------------------------------

  async #getToken(): Promise<Either<string, Error>> {
    const { kind, value } = await this.#api.post<AuthResponse>(Auth.#ENDPOINT, this.#credentials, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      params: { grant_type: "client_credentials" },
    });

    if (kind === "failure") {
      this.#stopTokenAutoRefresh();

      return {
        kind: "failure",
        value: new Error("An error occurred while trying to get the token."),
      };
    }

    return { kind: "success", value: value.access_token };
  }

  #setTokenToApis(token: string) {
    for (const api of this.#updateList) {
      api.bearerToken = token;
    }

    this.#logger.info(this.#loggerName, "A new token was setted to apis authorization headers.");
  }

  #startTokenAutoRefresh() {
    this.#intervalId = setInterval(this.refreshToken.bind(this), this.#intervalTime);
    this.#logger.info(this.#loggerName, "The token auto refresh process has started.");
  }

  #stopTokenAutoRefresh() {
    if (this.#intervalId) clearInterval(this.#intervalId);
    this.#logger.info(this.#loggerName, "The token auto refresh process has stopped.");
  }
}
