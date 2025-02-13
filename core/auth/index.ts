import assert from "node:assert";
import { MaplinkModule } from "core/maplink/module";
import type { ModulePrivilegedScope } from "core/maplink/scope";
import type { _SDK } from "core/maplink/types";
import { Api } from "lib/api";
import { Failure, Success } from "utils/either";
import type { Either } from "utils/types";
import { Token } from "./token";
import type { _Auth } from "./types";

export class Auth extends MaplinkModule<ModulePrivilegedScope> {
  static readonly METADATA: _SDK.Module.Metadata = {
    name: "auth",
    version: "0.0.1",
    description: "Handles the authentication process.",
  };

  static readonly #ENDPOINT = "/oauth/client_credential/accesstoken";
  static readonly #INTERVAL_BASE = 60 * 1000; // 1 minute
  static readonly #DEFAULT_INTERVAL = 30; // 30 minutes
  static readonly #MAX_ATTEMPTS = 50;

  readonly #updateList: Api[] = [];
  readonly #intervalTime: number;
  readonly #credentials: string;
  #intervalId?: NodeJS.Timeout;
  #token: Token;

  constructor(scope: ModulePrivilegedScope) {
    super(scope, Auth.METADATA);

    const { config } = scope;
    assert(config, "The SDK's configuration object is required.");

    const { clientId: client_id, clientSecret: client_secret } = config;
    this.#credentials = new URLSearchParams({ client_id, client_secret }).toString();

    const interval = config.refreshTokenInterval || Auth.#DEFAULT_INTERVAL;
    this.#intervalTime = interval * Auth.#INTERVAL_BASE;

    this.#token = new Token(this.#intervalTime);
    this.#token.onUpdate(this.#setTokenToApis.bind(this));

    this.api.on("clone", (api) => {
      this.appendApi(api);
      if (this.#token.isValid) api.bearerToken = this.#token.value as string;
    });

    this.api.defaults.name = "auth";
    this.logger.prefix = "[AUTH]";
  }

  init(): Promise<Either<string, string>> {
    this.logger.info("Starting module...");
    this.#startTokenAutoRefresh();
    return this.refreshToken();
  }

  appendApi(api: Api) {
    assert(api instanceof Api, "The API instance must be an instance of the Api class.");
    this.#updateList.push(api);
  }

  async refreshToken(): Promise<Either<string, string>> {
    let token = this.#token.value ?? "";

    if (!this.#token.isValid) {
      const { kind, value } = await this.#getToken();
      if (kind === "failure") return new Failure(value.message);
      this.#token.value = value;
      token = value;
    } else {
      this.#setTokenToApis();
    }

    return new Success(token);
  }

  async #getToken(attempt = 0): Promise<Either<string, Error>> {
    const response = await this.api.post<_Auth.Success, _Auth.Failure>(Auth.#ENDPOINT, this.#credentials, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      params: { grant_type: "client_credentials" },
    });

    if (response.kind === "failure") {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const nextAttempt = attempt + 1;

      if (nextAttempt < Auth.#MAX_ATTEMPTS) {
        this.logger.error(`Attempt ${nextAttempt} to get the token failed. Retrying...`);
        return this.#getToken(nextAttempt);
      }

      this.logger.warn("Max attempts to get a new token reached. Services will not be available.");
      return new Failure(new Error("Maximum attempts to get the token has been reached."), response);
    }

    return new Success(response.value.access_token);
  }

  #setTokenToApis() {
    if (!this.#token.value) return this.logger.warn("No token available to set to the APIs.");

    for (const api of this.#updateList) {
      api.bearerToken = this.#token.value;
    }

    this.logger.info("A new token has been setted to the APIs.");
  }

  #startTokenAutoRefresh() {
    this.#intervalId = setInterval(this.refreshToken.bind(this), this.#intervalTime);
    this.logger.info("The token auto refresh process has started.");
  }

  #stopTokenAutoRefresh() {
    if (!this.#intervalId) return;
    clearInterval(this.#intervalId);
    this.logger.info("The token auto refresh process has stopped.");
  }
}
