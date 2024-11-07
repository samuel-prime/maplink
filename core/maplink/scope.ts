import type { Api } from "core/api";
import type { Logger } from "core/logger";
import type { HttpServer } from "core/server";
import type { _SDK } from "./types";

export class ModuleScope implements _SDK.Module.Scope {
  constructor(
    readonly api: Api,
    readonly logger: Logger,
    readonly server?: HttpServer,
  ) {}
}

export class ModulePrivilegedScope implements _SDK.Module.PrivilegedScope {
  constructor(
    readonly api: Api,
    readonly logger: Logger,
    readonly config: _SDK.Config<any>,
    readonly server?: HttpServer,
  ) {}
}
