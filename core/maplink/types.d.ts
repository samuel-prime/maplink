type MaplinkSDK = import("./index").MaplinkSDK<any>;
type MaplinkModule = import("./module").MaplinkModule;
type Auth = import("../auth").Auth;
type Geocode = import("../../modules/geocode").Geocode;

// Maplink SDK Types -------------------------------------------------------------------------------

declare namespace SDK {
  /** Configuration object for the `MaplinkSDK` class. */
  interface Config<T extends ModulesList> {
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

  type ModulesList = NonEmptyArray<Constructor<MaplinkModule>>;

  /** Checks if the authentication module is in the config modules array. */
  type CheckForAuth<T extends ModulesList> = T[number] extends Constructor<Auth>
    ? "You should NOT inject the authentication module into the SDK."
    : T;
}

// Maplink Module Types ----------------------------------------------------------------------------

declare namespace Module {
  /**
   * Metadata object for the `MaplinkModule` class.
   * It provides information about the module, required for it's documentation.
   */
  interface Metadata {
    readonly name: Names;
    readonly version: string;
    readonly description: string;
  }

  /**
   * Scope object for the `MaplinkModule` class.
   * It provides access to the SDK's internal states and configuration.
   */
  interface Scope {
    readonly api: Api;
    readonly logger: Logger;
    readonly config?: MaplinkConfig;
  }

  /**
   * Modules available for the `MaplinkSDK` class.
   * **Custom modules should be added to this list.**
   */
  interface Services {
    auth: Auth;
    geocode: Geocode;
  }

  type Names = keyof Services;
  type Modules = Exclude<Services[Names] | MaplinkModule, Auth>;

  /** Gets the module's name and type as object. */
  type GetModulesAsObject<T extends Modules> = UnionToIntersection<
    T extends Geocode ? { geocode: Geocode } : never
  >;

  /** Extends the default `MaplinkSDK` class to include the modules added to it. */
  type ExtendSDK<T extends Modules> = MaplinkSDK & GetModulesAsObject<T>;
}

// Maplink Api Types -------------------------------------------------------------------------------

declare namespace MaplinkApi {
  /** Default error response structure. */
  interface DefaultErrorResponse<T = unknown> {
    title: string;
    /** Http status code. */
    status: number;
    /** External url with more information about the error. */
    type: string;
    details: T[];
  }
}
