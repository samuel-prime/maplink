import type { Api } from "core/api";
import type { Auth } from "core/auth";
import type { Logger } from "core/logger";
import type { HttpServer } from "core/server";
import type { Geocode } from "modules/geocode";
import type { Constructor, FilterKeys, NonEmptyArray } from "utils/types";
import type { MaplinkSDK } from ".";

export namespace _SDK {
  export interface Config<T extends Module.ConfigList> {
    modules: T;
    clientId: string;
    clientSecret: string;
    lazyInit?: boolean;
    serverPort?: number;
    enableLogger?: boolean;
    refreshTokenInterval?: number;
  }

  export interface Initializer<T extends Module.ConfigList> {
    init(): Promise<Module.ExtendSDK<T>>;
  }

  export type GetPackage<T extends Config<any>> = T extends Config<infer U>
    ? T["lazyInit"] extends true
      ? Module.ExtendSDK<U>
      : Initializer<U>
    : never;

  export namespace Api {
    export interface DefaultErrorResponse<T = unknown> {
      status: number;
      title: string;
      type: string;
      details: T[];
    }
  }

  export namespace Module {
    interface RequiredServices {
      server: HttpServer;
      auth: Auth;
    }

    export interface Services {
      geocode: Geocode;
    }

    export type Names = keyof Services;
    export type List = Services[Names];
    export type ConfigList = NonEmptyArray<Constructor<List>>;

    export interface Metadata {
      readonly name: Names | keyof RequiredServices;
      readonly version: string;
      readonly description: string;
    }

    export interface Scope {
      readonly api: Api;
      readonly logger: Logger;
      readonly server?: HttpServer;
    }

    export interface PrivilegedScope extends Scope {
      readonly config: Config<any>;
    }

    type PickServices<T extends List> = Pick<Services, FilterKeys<Services, T>>;
    export type ExtendSDK<T extends ConfigList> = MaplinkSDK<T> & PickServices<InstanceType<T[number]>>;
  }
}
