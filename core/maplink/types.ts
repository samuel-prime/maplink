import type { Api } from "core/api";
import type { Auth } from "core/auth";
import type { Logger } from "core/logger";
import type { Geocode } from "modules/geocode";
import type { Constructor, NonEmptyArray, UnionToIntersection } from "utils/types";
import type { MaplinkSDK } from ".";
import type { MaplinkModule } from "./module";

// Maplink SDK Types -------------------------------------------------------------------------------

export namespace SDK {
  /** Configuration object for the `MaplinkSDK` class. */
  export interface Config<T extends ModulesList> {
    /** **Required** to access the maplink's services. */
    url: string;
    /** **Required** to authenticate the services. */
    clientId: string;
    /** **Required** to authenticate the services. */
    clientSecret: string;
    /** **Required** to use the maplink's services. */
    modules: CheckForAuth<T>;
    /** **Optional** - Enables the internal logger. Default is `false`. */
    enableLogger?: boolean;
    /** **Optional** - Sets the interval *(in minutes)* which the token will be refreshed. Default is `30`. */
    refreshTokenInterval?: number;
  }

  export type ModulesList = NonEmptyArray<Constructor<MaplinkModule>>;

  /** Checks if the authentication module is in the config modules array. */
  export type CheckForAuth<T extends ModulesList> = T[number] extends Constructor<Auth>
    ? "You should NOT inject the authentication module into the SDK."
    : T;
}

// Maplink Module Types ----------------------------------------------------------------------------

export namespace Module {
  /**
   * Metadata object for the `MaplinkModule` class.
   * It provides information about the module, required for it's documentation.
   */
  export interface Metadata {
    readonly name: Names;
    readonly version: string;
    readonly description: string;
  }

  /**
   * Scope object for the `MaplinkModule` class.
   * It provides access to the SDK's internal states and configuration.
   */
  export interface Scope {
    readonly api: Api;
    readonly logger: Logger;
    readonly config?: SDK.Config<any>;
  }

  /**
   * Modules available for the `MaplinkSDK` class.
   * **Custom modules should be added to this list.**
   */
  export interface Services {
    auth: Auth;
    geocode: Geocode;
  }

  export type Names = keyof Services;
  export type Modules = Exclude<Services[Names] | MaplinkModule, Auth>;

  /** Gets the module's name and type as object. */
  export type GetModulesAsObject<T extends Modules> = UnionToIntersection<
    T extends Geocode ? { geocode: Geocode } : never
  >;

  /** Extends the default `MaplinkSDK` class to include the modules added to it. */
  export type ExtendSDK<T extends Modules> = MaplinkSDK<any> & GetModulesAsObject<T>;
}

// Maplink Api Types -------------------------------------------------------------------------------

export namespace MaplinkApi {
  /** Default error response structure. */
  export interface DefaultErrorResponse<T = unknown> {
    title: string;
    /** Http status code. */
    status: number;
    /** External url with more information about the error. */
    type: string;
    details: T[];
  }
}
