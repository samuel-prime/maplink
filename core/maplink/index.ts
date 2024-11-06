import { Api } from "core/api";
import { Auth } from "core/auth";
import { Logger } from "core/logger";
import assert from "node:assert";
import { MaplinkModule } from "./module";
import { ModulePrivilegedScope, ModuleScope } from "./scope";
import type { _SDK } from "./types";

export class MaplinkSDK<T extends _SDK.Module.ConfigList> {
  static readonly #BASE_URL = "https://api.maplink.global";

  readonly #api = new Api(MaplinkSDK.#BASE_URL);
  readonly #logger = new Logger("[SDK]");
  readonly #config: _SDK.Config<T>;
  readonly #auth: Auth;

  private constructor(config: _SDK.Config<T>) {
    this.#config = { ...config, modules: this.#resolveModules(config.modules) };
    this.#auth = new Auth(this.#createPrivilegedScope());

    this.#logger.enabled = !!config.enableLogger;
    if (config.lazyInit) this.#lazyInit();
  }

  static create<T extends _SDK.Module.ConfigList, U extends _SDK.Config<T>>(config: U) {
    const maplink = new MaplinkSDK(config);
    return (config.lazyInit ? maplink : maplink.#createInitializer()) as _SDK.GetPackage<U>;
  }

  #resolveModules(modules: _SDK.Config<T>["modules"]) {
    assert(modules.length, "At least one module is required.");

    for (const Module of modules) {
      assert(Module.prototype instanceof MaplinkModule, "All modules must extend the MaplinkModule class.");
      assert(!(Module instanceof Auth), "The Auth module is already included in the SDK.");
    }

    return Array.from(new Set(modules)) as _SDK.Config<T>["modules"];
  }

  #createInitializer(): _SDK.Initializer<T> {
    return Object.freeze({
      init: async () => {
        await this.#init();
        return this as unknown as _SDK.Module.ExtendSDK<T>;
      },
    });
  }

  async #init() {
    this.#logger.info("Starting SDK...");
    this.#loadRequiredModules();
    this.#loadModules();
    this.#logger.info("Package is ready.");
  }

  async #lazyInit() {
    this.#logger.info("Lazy initialization enabled.");

    this.#api
      .beforeFetch(async () => {
        this.#logger.info("Starting SDK...");
        this.#loadRequiredModules();
        this.#logger.info("Package is ready.");
      })
      .once()
      .global();

    this.#loadModules();
  }

  async #loadRequiredModules() {
    const initAuth = await this.#auth.init();
    assert(initAuth.kind === "success", `Failed to start: ${initAuth.value?.message}`);
  }

  #loadModules() {
    this.#logger.info("Loading modules...");

    for (const Module of this.#config.modules) {
      const module = new Module(this.#createScope());
      Object.assign(this, Object.freeze({ [module.metadata.name]: module }));
    }

    this.#logger.info("Modules loaded:", this.#config.modules.map((m) => m.name).join(", "));
  }

  #createScope() {
    return new ModuleScope(this.#api.clone(), this.#logger.clone());
  }

  #createPrivilegedScope() {
    return new ModulePrivilegedScope(this.#api, this.#logger.clone(), this.#config);
  }
}
