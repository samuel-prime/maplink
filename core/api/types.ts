import type { Api } from ".";
import type { Url } from "./url";

export namespace _Api {
  /** Api configuration object. */
  export interface Config {
    baseUrl: Url;
    defaults: Defaults;
  }

  /** Api default configuration. It merges with the *request specific* configuration. */
  export interface Defaults {
    headers: RequestHeaders;
    params: RequestParams;
  }

  /** Api default events. The `key` is the event name and the `value` is the event arguments. */
  export interface Events {
    clone: [Api];
  }

  /** Api *request specific* configuration. It will override the Api instance's defaults. */
  export type RequestConfig = Partial<{
    headers: RequestHeaders;
    params: RequestParams;
  }>;

  /** Gets the Api required resquest arguments based on the http method. */
  export type RequestArgs<T extends HttpMethods> = T extends "GET" | "DELETE"
    ? [string, RequestConfig?]
    : [string, RequestBody?, RequestConfig?];

  // Http Related Types ----------------------------------------------------------------------------

  export type HttpMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  export type RequestHeaders = {
    [x: string]: string;
  } & Partial<{
    "Content-Type": string;
    Authorization: string;
    Accept: string;
    "Cache-Control": string;
    "User-Agent": string;
    Origin: string;
  }>;

  export type RequestBody = string | number | object | undefined;
  export type RequestParams = Record<string, string>;
}
