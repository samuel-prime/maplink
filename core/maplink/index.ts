import { Api } from "core/api";
import { Auth } from "core/auth";
import { Logger } from "core/logger";
import assert from "node:assert";
import type { Constructor } from "utils/types";
import { MaplinkInitializer } from "./initializer";
import { MaplinkModule } from "./module";
import type { Module, SDK } from "./types";

/**
 * ### MaplinkSDK
 *
 * The Maplink Platform is a set of APIs for managing the movement of people and goods,
 * optimizing distance, time, and resources, considering multiple constraints and business rules.
 *
 * This class serves as a SDK for the Maplink APIs, providing a set of modules that encapsulate
 * the functionalities of each API.
 *
 * For more information about the Maplink APIs, see the [official documentation](https://developers.maplink.global/).
 */
export class MaplinkSDK<T extends SDK.ModulesList> {
  readonly #config: SDK.Config<T>;
  readonly #api: Api;
  readonly #logger = new Logger("[SDK]");
  readonly #auth: Auth;

  private constructor(config: SDK.Config<T>) {
    this.#config = config;
    this.#api = new Api(config.url);
    this.#auth = new Auth(this.#createPrivilegedScope());
    this.#logger.enabled = !!config.enableLogger;
  }

  /**
   * Creates a new `MaplinkInitializer` with the SDK's instance.
   * The services will be available after the initialization.
   */
  static create<T extends SDK.ModulesList>(config: SDK.Config<T>) {
    const maplink = new MaplinkSDK(config);
    return new MaplinkInitializer(maplink, maplink.#init.bind(maplink));
  }

  // Private Methods -------------------------------------------------------------------------------

  // This method is called by the initializer to start the SDK.
  async #init() {
    this.#logger.info("Starting SDK...");
    const result = await this.#auth.init();

    if (result.kind === "success") {
      this.#loadModules();
      this.#logger.info("Package is ready.");
    } else {
      this.#logger.info("Failed to start:", result.value.message);
    }
  }

  // This method loads the modules into the SDK instance, but it doesn't alter the class type itself.
  // It is the initializer that will extend the class type with the modules types.
  #loadModules() {
    this.#logger.info("Loading modules...");

    const modules = this.#config.modules as Constructor<MaplinkModule>[];
    const modulesNames = modules.map((m) => m.name).join(", ");

    for (const Module of modules) {
      assert(Module.prototype instanceof MaplinkModule, `Module "${Module.name}" not recognized.`);
      assert(!(Module instanceof Auth), "Cannot inject the authentication module into the SDK.");
      const module = new Module(this.#createScope());
      Object.assign(this, Object.freeze({ [module.metadata.name]: module }));
    }

    this.#logger.info("Modules loaded:", modulesNames);
  }

  #createScope(): Module.Scope {
    return { api: this.#api.clone(), logger: this.#logger.clone() };
  }

  #createPrivilegedScope(): Module.Scope {
    return { api: this.#api, logger: this.#logger.clone(), config: this.#config };
  }
}
