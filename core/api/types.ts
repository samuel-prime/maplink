import type { _Http } from "core/http/types";
import type { Either } from "utils/types";
import type { Api } from ".";
import type { ApiFetch } from "./fetch";
import type { ApiHook } from "./hook";
import type { ApiRequest } from "./request";
import type { ApiResponse } from "./response";
import type { Url } from "./url";

export namespace _Api {
  export interface Config {
    readonly baseUrl: Url;
    readonly defaults: Defaults;
  }

  export interface Defaults {
    headers?: _Http.Headers;
    params?: Request.Params;
    callback?: Request.Callback;
  }

  export interface AsyncContext {
    readonly fetchId: string;
    readonly hooks: Hooks.List;
    readonly emitter: Events.Emitter;
    readonly requestConfig: Request.Config;
  }

  export namespace Events {
    export interface List {
      clone: [Api];
      hookAppend: [ApiHook];
      request: [ApiRequest];
      response: [ApiResponse];
    }

    export type Names = keyof List;
    export type Emitter = <K extends Names>(event: K, ...args: List[K]) => void;
    export type Listener<K extends Names> = (...args: List[K]) => void | Promise<void>;
  }

  export namespace Hooks {
    export type Moments = "beforeFetch" | "afterFetch";
    export type List = { [K in Moments]: ApiHook<K>[] };
    export type Function = <T, E>(fetch: ApiFetch<T, E>) => Promise<void>;
  }

  export namespace Fetch {
    type MethodsWithoutBody = "GET" | "DELETE";

    export type Config = Partial<{
      name: string;
      headers: _Http.Headers;
      params: Request.Params;
      callback: Request.Callback;
      hooks: { [K in Hooks.Moments]?: Hooks.Function[] };
    }>;

    type ArgsWithoutBody<T extends _Http.Methods> = [T, string, Partial<Config>?];
    type ArgsWithBody<T extends _Http.Methods> = [T, string, Request.Body?, Partial<Config>?];

    export type GetArgs<T extends _Http.Methods> = T extends MethodsWithoutBody ? ArgsWithoutBody<T> : ArgsWithBody<T>;
  }

  export namespace Request {
    export interface Config {
      readonly method: _Http.Methods;
      readonly url: Url;
      params?: Params;
      readonly body: Body;
      callback?: Callback;
      readonly headers: _Http.Headers;
    }

    export interface Callback {
      readonly url: string;
      readonly user?: string;
      readonly password?: string;
    }

    export type Body = string | number | { [x: string]: any; callback?: Callback } | undefined;
    export type Params = Record<string, string | number | boolean>;
  }

  export namespace Response {
    export interface Parser<T = unknown, E = unknown> {
      readonly response: Response;
      parse(): Promise<Either<T, E | Error>>;
    }
  }
}
