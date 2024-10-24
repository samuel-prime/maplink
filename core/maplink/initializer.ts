import type { MaplinkSDK } from ".";
import type { Module, SDK } from "./types";

/**
 * Class responsible for ensuring that the SDK's required modules are initialized
 * before granting access to it's services (or modules).
 *
 * It also ensures that the SDK is only initialized once, and extends it's type
 * to include the modules that were injected.
 */
export class MaplinkInitializer<T extends SDK.ModulesList> {
  readonly #maplink: MaplinkSDK<T>;
  readonly #initialize: () => Promise<void>;

  constructor(maplink: MaplinkSDK<T>, initialize: () => Promise<void>) {
    this.#maplink = maplink;
    this.#initialize = initialize;
  }

  async init() {
    await this.#initialize();
    return this.#maplink as Module.ExtendSDK<InstanceType<T[number]>>;
  }
}
