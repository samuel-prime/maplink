import type { Api } from "core/api";
import type { Logger } from "core/logger";
import type { HttpServer } from "core/server";
import assert from "node:assert";
import type { ModulePrivilegedScope, ModuleScope } from "./scope";
import type { _SDK } from "./types";

export abstract class MaplinkModule<T extends ModuleScope | ModulePrivilegedScope = ModuleScope> {
  readonly metadata: _SDK.Module.Metadata;
  readonly #scope: T;

  constructor(scope: T, metadata: _SDK.Module.Metadata) {
    assert(metadata, "The module metadata is required.");
    assert(scope, "The module scope is required.");

    this.metadata = metadata;
    this.#scope = scope;
  }

  protected get api(): Api {
    return this.#scope.api;
  }

  protected get logger(): Logger {
    return this.#scope.logger;
  }

  protected get server(): HttpServer | undefined {
    return this.#scope.server;
  }

  protected get config() {
    return (this.#scope as ModulePrivilegedScope).config as T extends ModulePrivilegedScope ? _SDK.Config<any> : never;
  }
}
