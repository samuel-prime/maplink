type Api = import("./index").Api;
type Url = import("./url").Url;

declare namespace Api {
  /** Api configuration object. */
  interface Config {
    baseUrl: Url;
    defaults: ApiDefaults;
  }

  /** Api default configuration. It merges with the *request specific* configuration. */
  interface Defaults {
    headers: RequestHeaders;
    params: RequestParams;
  }

  /** Api default events. The `key` is the event name and the `value` is the event arguments. */
  interface Events {
    clone: [Api];
  }

  /** Api *request specific* configuration. It will override the Api instance's defaults. */
  type RequestConfig = Partial<{
    headers: RequestHeaders;
    params: RequestParams;
  }>;

  /** Gets the Api required resquest arguments based on the http method. */
  type RequestArgs<T extends HttpMethods> = T extends "GET" | "DELETE"
    ? [string, RequestConfig?]
    : [string, RequestBody?, RequestConfig?];

  // Http Related Types ----------------------------------------------------------------------------

  type HttpMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  type RequestHeaders = {
    [x: string]: string;
    "Content-Type"?: string;
    Authorization?: string;
    Accept?: string;
    "Cache-Control"?: string;
    "User-Agent"?: string;
    Origin?: string;
  };

  type RequestBody = string | number | object | undefined;
  type RequestParams = Record<string, string>;
}
