import { randomUUID } from "node:crypto";
import type { _Api } from "./types";

export class ApiAsyncContext implements _Api.AsyncContext {
  readonly fetchId = randomUUID();

  constructor(
    readonly requestConfig: _Api.AsyncContext["requestConfig"],
    readonly emitter: _Api.AsyncContext["emitter"],
    readonly hooks: _Api.AsyncContext["hooks"],
  ) {}
}
