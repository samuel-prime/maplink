import type { Api } from "core/api";
import type { Logger } from "core/logger";
import assert from "node:assert";

/**
 * Abstract base class for a Maplink module.
 *
 * This class provides the foundational structure for creating a module within the Maplink system.
 * It ensures that each module has access to the necessary `api` and `logging` mechanisms.
 *
 * @abstract
 */
export abstract class MaplinkModule {
  protected readonly api: Api;
  protected readonly logger: Logger;
  readonly metadata: Module.Metadata;

  constructor(scope: Module.Scope, metadata: Module.Metadata) {
    assert(scope, "Module scope is required.");
    this.api = scope.api;
    this.logger = scope.logger;

    assert(metadata, "Module metadata is required.");
    this.metadata = metadata;
  }
}
