// API Types ---------------------------------------------------------------------------------------

/**
 * Configuration for the API.
 */
declare interface ApiConfig {
  baseUrl: Url;
  defaults: ApiDefaults;
}

/**
 * Default settings for the API.
 */
declare interface ApiDefaults {
  headers: RequestHeaders;
  params: RequestParams;
}

/**
 * Events related to the API.
 */
declare interface ApiEvents {
  clone: [Api];
}

// HTTP Related Types ------------------------------------------------------------------------------

/**
 * HTTP methods.
 */
declare type HttpMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Common header names for HTTP requests.
 */
declare type RequestCommonHeaderNames =
  | "Content-Type"
  | "Authorization"
  | "Accept"
  | "Cache-Control"
  | "User-Agent"
  | "Referer"
  | "Origin";

/**
 * Headers for HTTP requests.
 */
declare interface RequestHeaders {
  [key: RequestCommonHeaderNames | (string & {})]: string;
}

/**
 * Body of an HTTP request.
 */
declare type RequestBody = string | number | object | undefined;

/**
 * Parameters for HTTP requests.
 */
declare interface RequestParams {
  [key: string]: string;
}

/**
 * Webhook configuration for HTTP requests.
 */
declare interface RequestWebhook {
  url: string;
  user: string;
  password: string;
}

/**
 * Configuration for an HTTP request.
 */
declare type RequestConfig = Partial<{
  params: RequestParams;
  headers: RequestHeaders;
  webhook: RequestWebhook;
}>;

/**
 * Data for an HTTP request.
 */
declare type RequestData = [string, RequestHeaders, string];

/**
 * Arguments for an HTTP request.
 * @template T - The HTTP method.
 */
declare type RequestArgs<T extends HttpMethods> = T extends "GET" | "DELETE"
  ? [string, RequestConfig?]
  : [string, RequestBody?, RequestConfig?];
