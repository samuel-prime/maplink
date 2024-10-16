import type { Api } from "lib/api";
import type { Logger } from "lib/logger";

export class OAuth {
  readonly #api: Api;
  readonly #updateList: Api[] = [];
  readonly #logger: Logger;
  readonly #credentials: string;
  readonly #intervalTime: number;
  #intervalId?: NodeJS.Timeout;
  #token?: string;
  #tokenExpiry?: number;

  static readonly #ENDPOINT = "/oauth/client_credential/accesstoken";
  static readonly #BASE_TIME = 60 * 1000;

  constructor(api: Api, config: OAuthConfig, logger: Logger) {
    const { clientId: client_id, clientSecret: client_secret } = config;

    this.#api = api;
    this.#logger = logger;
    this.#credentials = new URLSearchParams({ client_id, client_secret }).toString();
    this.#intervalTime = config.refreshTokenInterval * OAuth.#BASE_TIME;
    this.#startTokenRefresh();
  }

  appendApi(api: Api) {
    this.#updateList.push(api);
  }

  async setAuthorization() {
    if (this.#token && this.#tokenExpiry && Date.now() < this.#tokenExpiry) {
      this.#updateApis(this.#token);
      return;
    }

    const { kind, value } = await this.#getToken();

    if (kind === "failure") {
      this.#logger.error("OAUTH", value.message);
      return;
    }

    this.#token = value;
    this.#tokenExpiry = Date.now() + this.#intervalTime;

    this.#updateApis(value);
  }

  async #getToken(): Promise<Either<string, Error>> {
    const { kind, value } = await this.#api.post<OAuthResponse>(OAuth.#ENDPOINT, this.#credentials, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      params: { grant_type: "client_credentials" },
    });

    if (kind === "failure") {
      this.#stopTokenRefresh();

      return {
        kind: "failure",
        value: new Error("An error occurred while trying to get the token."),
      };
    }

    return { kind: "success", value: value.access_token };
  }

  #updateApis(token: string) {
    for (const api of this.#updateList) {
      api.bearerToken = token;
    }

    this.#logger.info("OAUTH", "The authorization token has been updated.");
  }

  #startTokenRefresh() {
    this.#intervalId = setInterval(this.setAuthorization.bind(this), this.#intervalTime);
    this.#logger.info("OAUTH", "The token refresh process has started.");
  }

  #stopTokenRefresh() {
    if (this.#intervalId) clearInterval(this.#intervalId);
    this.#logger.info("OAUTH", "The token refresh process has stopped.");
  }
}
