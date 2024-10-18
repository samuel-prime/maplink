declare namespace Geocode {
  // Geocode Generic Types -------------------------------------------------------------------------

  /**
   * The type of the geocode search.
   * Represents the approach used to find the address(es).
   */
  type SearchApproaches = "ZIPCODE" | "STATE" | "CITY" | "DISTRICT";

  /**
   * The search modes available for the geocode module.
   * Each mode has an associated search method and response type.
   */
  interface SearchModes {
    default: [SearchAddress, Address];
    multiDefault: [NonEmptyArray<{ id: string } & SearchAddress>, Address];
    suggestion: [string, Address];
    reverse: [[Coordinates], Address];
    multiReverse: [NonEmptyArray<{ id: string } & Coordinates>, ExtendedAddress];
  }

  /**
   * The available search modes for the geocode module.
   */
  type Modes = keyof SearchModes;

  /**
   * The input type for each search mode.
   */
  type ModeInput<K extends Modes = Modes> = SearchModes[K][0];

  /**
   * The output type for each search mode.
   */
  type ModeOutput<K extends Modes = Modes> = Response<SearchModes[K][1]>;

  /**
   * Selects the output type based on the input type.
   */
  type SelectModeOutput<T extends ModeInput> = T extends ModeInput<"default">
    ? ModeOutput<"default">
    : T extends ModeInput<"multiDefault">
      ? ModeOutput<"multiDefault">
      : T extends ModeInput<"suggestion">
        ? ModeOutput<"suggestion">
        : T extends ModeInput<"reverse">
          ? ModeOutput<"reverse">
          : T extends ModeInput<"multiReverse">
            ? ModeOutput<"multiReverse">
            : never;

  // Geocode Address Types -------------------------------------------------------------------------

  /**
   * The coordinates in a geocode address.
   */
  interface Coordinates {
    readonly lat: number;
    readonly lon: number;
  }

  /**
   * The state information in a geocode address.
   */
  interface AddressState {
    readonly code: string;
    readonly name: string;
  }

  /**
   * Represents the default geocode address.
   */
  interface Address {
    readonly road: string;
    readonly district: string;
    readonly zipCode: string;
    readonly city: string;
    readonly state: AddressState;
    readonly mainLocation: Coordinates;
  }

  /**
   * Extends Address to include additional properties.
   * This is used on **multi reverse mode** searches.
   */
  interface ExtendedAddress extends Address {
    /**
     * The geometry coordinates.
     * It represents the approximate area of the address.
     */
    readonly geometry: [Coordinates, Coordinates];
    readonly leftZipCode: string;
    readonly rightZipCode: string;
    readonly leftFirstNumber: number;
    readonly leftLastNumber: number;
    readonly rightFirstNumber: number;
    readonly rightLastNumber: number;
  }

  // Geocode Result Types --------------------------------------------------------------------------

  /**
   * Represents a single result in a geocode response.
   */
  interface Result<T extends Address | ExtendedAddress> {
    /**
     * The unique identifier for the result.
     * It can be set in the request, otherwise it will be generated as an UUID.
     */
    readonly id: string;
    /**
     * The address information.
     * It is `extended` when using the **multi reverse mode** search.
     */
    readonly address: T;
    /**
     * The type of the approach used by the geocode to search.
     */
    readonly type: SearchApproaches;
    /**
     * Reference score of the geocoding process result.
     * The higher the number, the more reliable the result is.
     */
    readonly score: number;
    /**
     * Distance in meters from the sent coordinate.
     * It only appears in **multi reverse mode** searches.
     */
    readonly distance?: number;
    /**
     * Full address found used in the geocoding process.
     */
    readonly label: string;
  }

  /**
   * The response from a geocode search.
   */
  interface Response<T extends Address | ExtendedAddress> {
    readonly found: number;
    readonly results: ReadonlyArray<Result<T>>;
  }

  // Search Address Types --------------------------------------------------------------------------

  /**
   * The required parameters for a search address.
   * Requires at least one of the properties to be set.
   */
  type RequiredSearchAddressParams = NonEmptyObject<{
    road: string;
    /**
     * The street number.
     * DO NOT include additional address details.
     */
    number: number;
    city: string;
    /**
     * The state code.
     * MUST be in uppercase and abbreviated.
     */
    state: string;
    /**
     * The country name.
     * Must set **globalSearch** to true in order to search outside of Brazil.
     */
    country: string;
    district: string;
    zipcode: string;
  }>;

  /**
   * The optional parameters for a search address.
   */
  interface OptionalSearchAddressParams {
    /**
     * Limits the type of search.
     * Only for addresses in Brazil and if the **globalSearch** parameter is not provided.
     */
    type?: SearchApproaches;
  }

  /**
   * The combined required and optional parameters for a search address.
   */
  type SearchAddress = RequiredSearchAddressParams & OptionalSearchAddressParams;
}
