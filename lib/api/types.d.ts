/**
 * Represents the HTTP methods used in requests.
 */
declare type HttpMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Common header names used in requests.
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
 * Represents the headers of a request.
 */
declare interface RequestHeaders {
  [key: RequestCommonHeaderNames | (string & {})]: string;
}

/**
 * Represents the body of a request.
 */
declare type RequestBody = string | number | object | undefined;

/**
 * Represents the parameters of a request.
 */
declare interface RequestParams {
  [key: string]: string;
}

/**
 * Represents the webhook configuration for a request.
 */
declare interface RequestWebhook {
  url: string;
  user: string;
  password: string;
}

/**
 * Represents the default configuration for API requests.
 */
declare interface ApiDefaults {
  headers: RequestHeaders;
}

/**
 * Represents the configuration for the API.
 */
declare interface ApiConfig {
  baseUrl: string;
  defaults: ApiDefaults;
}

/**
 * Represents the configuration for a request.
 */
declare type RequestConfig = Partial<{
  params: RequestParams;
  headers: RequestHeaders;
  webhook: RequestWebhook;
}>;

/**
 * Represents the data of a request.
 */
declare type RequestData = [string, RequestHeaders, string];

/**
 * Represents the args of a request.
 */
declare type RequestArgs<T extends HttpMethods> = T extends "GET" | "DELETE"
  ? [string, RequestConfig?]
  : [string, RequestBody?, RequestConfig?];
