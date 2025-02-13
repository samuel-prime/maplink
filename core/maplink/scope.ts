import type { Monitor } from "core/monitor";
import type { Api } from "lib/api";
import type { Logger } from "lib/logger";
import type { HttpServer } from "lib/server";
import type { _SDK } from "./types";

export class ModuleScope implements _SDK.Module.Scope {
  constructor(
    readonly api: Api,
    readonly logger: Logger,
    readonly server: HttpServer,
    readonly monitor: Monitor,
  ) {}
}

export class ModulePrivilegedScope implements _SDK.Module.PrivilegedScope {
  constructor(
    readonly api: Api,
    readonly logger: Logger,
    readonly server: HttpServer,
    readonly config: _SDK.Config<any>,
    readonly monitor: Monitor,
  ) {}
}
