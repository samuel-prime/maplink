import type { Api } from "core/api";
import { MaplinkModule } from "core/maplink/module";
import assert from "node:assert";
import { Token } from "./token";

/**
 * ### Authentication API
 *
 * The `Auth` class handles the authentication process for the `MaplinkSDK` class.
 *
 * It manages the bearer token, including refreshing it at regular intervals and
 * updating the token for all API instances in the update list.
 *
 * For more information, see the [official documentation](https://developers.maplink.global/como-gerar-o-token-para-autenticacao/).
 */
export class Auth extends MaplinkModule {
  static readonly #ENDPOINT = "/oauth/client_credential/accesstoken";
  static readonly #INTERVAL_BASE = 60 * 1000; // 1 minute
  static readonly #DEFAULT_INTERVAL = 30; // 30 minutes
  static readonly #MAX_ATTEMPTS = 3;

  readonly #updateList: Api[] = [];
  readonly #credentials: string;
  readonly #intervalTime: number;
  #intervalId?: NodeJS.Timeout;
  #token: Token;

  constructor(scope: Module.Scope) {
    super(scope, {
      name: "auth",
      version: "1.0.0",
      description: "Handles the authentication process.",
    });

    const { config } = scope;
    assert(config, "The configuration object is required.");

    const { clientId: client_id, clientSecret: client_secret } = config;
    this.#credentials = new URLSearchParams({ client_id, client_secret }).toString();

    const interval = config.refreshTokenInterval || Auth.#DEFAULT_INTERVAL;
    this.#intervalTime = interval * Auth.#INTERVAL_BASE;

    // Creates a new token instance and sets an event listener to update the APIs upon token update.
    this.#token = new Token(this.#intervalTime);
    this.#token.onUpdate(this.#setTokenToApis.bind(this));

    // Listens to the clone event to append the new API instance to the update list.
    // Also sets the bearer token to the new API instance if it is valid.
    this.api.on("clone", (api) => {
      this.appendApi(api);
      if (this.#token.isValid) api.bearerToken = this.#token.value as string;
    });

    this.logger.prefix = "[AUTH]";
  }

  // Public Methods --------------------------------------------------------------------------------

  /** Updates the token and starts it's auto refresh routine. */
  init(): Promise<Either<null, Error>> {
    this.logger.info("Starting module...");
    this.#startTokenAutoRefresh();
    return this.refreshToken();
  }

  /**
   * Appends an API instance to the update list, which will have their bearer token updated
   * whenever a new token is generated.
   */
  appendApi(api: Api) {
    this.#updateList.push(api);
  }

  /**
   * Refreshes the access token and updates the APIs in the update list with the new token.
   * If the token is NOT expired, it only updates the APIs in the update list.
   */
  async refreshToken(): Promise<Either<null, Error>> {
    if (!this.#token.isValid) {
      const tokenResult = await this.#getToken();
      if (tokenResult.kind === "failure") return tokenResult;
      this.#token.value = tokenResult.value;
    } else {
      this.#setTokenToApis();
    }

    return { kind: "success", value: null };
  }

  // Private Methods -------------------------------------------------------------------------------

  /**
   * Tries to get a new token from the authentication service up to the `MAX_ATTEMPTS` limit.
   * If the limit is reached, stops the token auto refresh and returns an error.
   */
  async #getToken(attempt = 0): Promise<Either<string, Error>> {
    const response = await this.api.post<Auth.Response>(Auth.#ENDPOINT, this.#credentials, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      params: { grant_type: "client_credentials" },
    });

    if (response.kind === "failure") {
      const nextAttempt = attempt + 1;

      if (nextAttempt < Auth.#MAX_ATTEMPTS) {
        this.logger.error(`Attempt ${nextAttempt} to get the token failed. Retrying...`);
        return this.#getToken(nextAttempt);
      }

      this.logger.warn("Max attempts to get a new token reached. Services will not be available.");
      this.#stopTokenAutoRefresh();

      return {
        kind: "failure",
        value: new Error("Maximum attempts to get the token has been reached."),
        previous: response,
      };
    }

    return { kind: "success", value: response.value.access_token };
  }

  #setTokenToApis() {
    if (!this.#token.value) return this.logger.warn("No token available to set to the APIs.");

    for (const api of this.#updateList) {
      api.bearerToken = this.#token.value;
    }

    this.logger.info("A new token has been setted to the APIs.");
  }

  #startTokenAutoRefresh() {
    if (this.#intervalId) this.#stopTokenAutoRefresh();
    this.#intervalId = setInterval(this.refreshToken.bind(this), this.#intervalTime);
    this.logger.info("The token auto refresh process has started.");
  }

  #stopTokenAutoRefresh() {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.logger.info("The token auto refresh process has stopped.");
    }
  }
}
