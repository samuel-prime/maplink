/**
 * Configuration for the `Maplink` class.
 */
declare interface MaplinkConfig extends AuthConfig {
  /**
   * The URL of the Maplink API.
   */
  url: string;
  /**
   * Enables the logger for the `Maplink` class.
   * @default true - Default value.
   */
  enableLogger?: boolean;
  /**
   * Initializes the instance by calling it's `init` method at instantiation.
   * @default true - Default value.
   */
  initialize?: boolean;
}

/**
 * Products available in the Maplink API.
 */
declare type MaplinkProducts =
  | "Matrix"
  | "Restriction Zone"
  | "Trip"
  | "Planning"
  | "Maps"
  | "Toll"
  | "Freight"
  | "Tracking"
  | "Place"
  | "Emission"
  | "Geocode";

/**
 * The default error response from the Maplink API.
 */
declare interface MaplinkErrorResponse<T = any> {
  /**
   * Title of the error.
   */
  title: string;
  /**
   * HTTP status code of the error.
   */
  status: number;
  /**
   * External URL with more information about the error.
   */
  type: string;
  /**
   * Detailed error data.
   */
  details: T[];
}

/**
 * `Maplink` scope DTO for internal modules.
 * Should **NOT** be used outside of the `Maplink` class.
 */
declare interface MaplinkModuleScope {
  readonly api: Api;
  readonly logger: Logger;
}
