import type { Api } from ".";
import type { ApiRequest } from "./request";
import type { ApiResponse } from "./response";
import type { Url } from "./url";

// #region _Api
/**
 * Namespace for API-related types.
 * It provides types for the Api class and other related objects.
 */
export namespace _Api {
  /**
   * Interface for the configuration needed to create an instance of the Api class.
   */
  export interface Config {
    baseUrl: Url;
    defaults: Defaults;
  }

  /**
   * Default configuration for the Api, used during requests.
   * This will be merged with the request-specific configuration provided before making a request.
   */
  export interface Defaults {
    headers: _Http.Headers;
    params: RequestParams;
  }

  /**
   * Events emitted by the Api class.
   * Unlike the `hooks`, these do not interfere with the request/response flow and cannot alter them.
   */
  export interface Events {
    clone: [Api];
    request: [ApiRequest];
    response: [ApiResponse<any, any>];
  }

  /**
   * Asynchronous context required to handle the Api's fetch operations.
   */
  export interface AsyncContext {
    id: string;
    requestHooks: RequestHook[];
    responseHooks: ResponseHook[];
    emitEvent: (event: keyof Events, ...args: Events[keyof Events]) => void;
  }

  // #region Request
  /**
   * Configuration specific to a request.
   * This will override the default configuration of the Api instance.
   */
  export type RequestConfig = Partial<
    { id: string } & Defaults & { [K in keyof Hooks]: Hooks[K][] }
  >;

  /**
   * Retrieves the required request arguments for the Api based on the HTTP method.
   */
  export type GetRequestArgs<T extends _Http.Methods> = T extends "GET" | "DELETE"
    ? [string, RequestConfig?]
    : [string, RequestBody?, RequestConfig?];

  export type RequestBody = string | number | object | undefined;
  export type RequestParams = Record<string, string>;
  // #endregion Request end

  // #region Hooks
  /**
   * Hooks that can be attached to an Api's fetch operation.
   * They can modify the request/response objects.
   */
  export interface Hooks {
    beforeRequest: RequestHook;
    afterResponse: ResponseHook;
  }

  export type RequestHook = (request: ApiRequest) => void | Promise<void>;
  export type ResponseHook = <T, E>(response: ApiResponse<T, E>) => void | Promise<void>;
  // #endregion Hooks end
}
// #endregion _Api end

// #region _Http
/**
 * Namespace for HTTP-related types.
 * It provides types for the Api class and other related objects.
 */
export namespace _Http {
  export type Methods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  type CommonHeaders = {
    "content-type": string;
    authorization: string;
    accept: string;
    "cache-control": string;
    "user-agent": string;
    origin: string;
    "accept-encoding": string;
    "accept-language": string;
    "access-control-allow-origin": string;
    "x-requested-with": string;
  };

  export type Headers = { [x: string]: string } & Partial<CommonHeaders>;
}
// #endregion Http end
