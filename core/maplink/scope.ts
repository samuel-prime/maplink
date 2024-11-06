import type { Api } from "core/api";
import type { Logger } from "core/logger";
import type { _SDK } from "./types";

export class ModuleScope implements _SDK.Module.Scope {
  constructor(
    readonly api: Api,
    readonly logger: Logger,
  ) {}
}

export class ModulePrivilegedScope implements _SDK.Module.PrivilegedScope {
  constructor(
    readonly api: Api,
    readonly logger: Logger,
    readonly config: _SDK.Config<any>,
  ) {}
}
