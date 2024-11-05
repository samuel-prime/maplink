import assert from "node:assert";
import { join } from "node:path";
import { isEmpty } from "utils/isEmpty";
import { isObject } from "utils/isObject";
import type { Prototype } from "utils/types";
import type { _Api } from "./types";

export class Url extends URL implements Prototype<Url> {
  set endpoint(endpoint: string) {
    assert(typeof endpoint === "string", "The endpoint must be a string.");
    this.pathname = join(this.pathname, endpoint);
  }

  set params(params: _Api.Request.Params | undefined | null) {
    assert(isObject(params) || params == null, "The params must be an object, undefined or null.");

    this.search = "";
    if (!params || isEmpty(params)) return;

    for (const [key, value] of Object.entries(params)) {
      if (!["string", "number", "boolean"].includes(typeof value)) continue;
      this.searchParams.append(key, String(value));
    }
  }

  clone(): Url {
    return new Url(this);
  }
}
