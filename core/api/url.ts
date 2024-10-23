import { assert } from "node:console";
import { join } from "node:path";

/** Extends the native `URL` class to provide additional functionality. */
export class Url extends URL {
  /** Sets the endpoint of the URL by joining the current pathname with the provided path. */
  set endpoint(path: string) {
    this.pathname = join(this.pathname, path);
  }

  /**
   * Sets the query parameters of the URL by converting the provided object into a query string.
   * If the provided object is not a valid object, an error is thrown.
   */
  set parameters(params: Record<string, string | number | boolean>) {
    assert(typeof params === "object" && !Array.isArray(params), "Params must be an object.");

    const hasOnlyPrimitives = Object.values(params).every((v) => !((v as any) instanceof Object));
    assert(hasOnlyPrimitives, "Params must only contain primitive values.");

    this.search = new URLSearchParams(params as Record<string, string>).toString();
  }
}
