import type { Auth } from "core/auth";
import type { Monitor } from "core/monitor";
import type { Api } from "lib/api";
import type { Logger } from "lib/logger";
import type { HttpServer } from "lib/server";
import type { Geocode } from "modules/geocode";
import type { Planning } from "modules/planning";
import type { Constructor, FilterKeys, NonEmptyArray } from "utils/types";
import type { MaplinkSDK } from ".";

export namespace _SDK {
  export interface Config<T extends Module.ConfigList> {
    modules: T;
    clientId: string;
    clientSecret: string;
    lazyInit?: boolean;
    serverPort: number;
    serverPublicUrl: string;
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

    export namespace Event {
      type Type = "STATUS_CHANGE" | "STEP_CHANGE" | "PERCENT_CHANGE" | "WARNING" | "ERROR";

      type Status =
        | "ENQUEUED"
        | "CONVERT_TO_MATRIX"
        | "PROCESSING"
        | "MATRIX_CALCULATION"
        | "CALCULATE_PLANNING"
        | "SOLVED";

      type Step =
        | `progress ${number}%`
        | "PRE_TREATMENTS"
        | "INITIAL_CONSTRUCTION"
        | "IMPROVEMENT"
        | "POST_TREATMENTS"
        | "TERMINATE";

      export interface Data {
        id: string;
        jobId: string;
        type: Type;
        description: Status | Step | number;
        createdAt: number;
      }
    }
  }

  export namespace Module {
    interface RequiredServices {
      monitor: Monitor;
      auth: Auth;
    }

    export interface Services {
      geocode: Geocode;
      planning: Planning;
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
      readonly server: HttpServer;
    }

    export interface PrivilegedScope extends Scope {
      readonly config: Config<any>;
    }

    type PickServices<T extends List> = Pick<Services, FilterKeys<Services, T>>;
    export type ExtendSDK<T extends ConfigList> = MaplinkSDK<T> & PickServices<InstanceType<T[number]>>;
  }
}
