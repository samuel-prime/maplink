import type { FilterKeys, NonEmptyArray, NonEmptyObject } from "utils/types";

export namespace _Geocode {
  export interface Coords {
    readonly lat: number;
    readonly lon: number;
  }

  export namespace Search {
    export type Approach = "ZIPCODE" | "STATE" | "CITY" | "DISTRICT";

    interface Modes {
      default: [Address, Response.Address];
      multiDefault: [NonEmptyArray<{ id: string } & Address>, Response.Address];
      suggestion: [string, Response.Address];
      reverse: [[Coords], Response.Address];
      multiReverse: [NonEmptyArray<{ id: string } & Coords>, Response.ExtendedAddress];
    }

    export type ModesNames = keyof Modes;
    export type Input<K extends ModesNames = ModesNames> = Modes[K][0];
    export type Output<K extends ModesNames = ModesNames> = Response.Data<Modes[K][1]>;
    export type SelectOutput<T extends Input> = T extends Input<infer U> ? Output<U> : never;

    export type ByBody = Input<FilterKeys<Modes, [object, any]>>;
    export type ByParams = Input<FilterKeys<Modes, [string, any]>>;

    export type Address = RequiredAddressParams & OptionalAddressParams;

    export type RequiredAddressParams = NonEmptyObject<{
      road: string;
      number: number;
      city: string;
      state: string;
      country: string;
      district: string;
      zipcode: string;
    }>;

    export type OptionalAddressParams = Partial<{ type: Approach }>;
  }

  export namespace Response {
    export interface Data<T extends Address | ExtendedAddress> {
      readonly found: number;
      readonly results: ReadonlyArray<{
        readonly id: string;
        readonly address: T;
        readonly type: Search.Approach;
        readonly score: number;
        readonly distance?: number;
        readonly label: string;
      }>;
    }

    export interface State {
      readonly code: string;
      readonly name: string;
    }

    export interface Address {
      readonly road: string;
      readonly district: string;
      readonly zipCode: string;
      readonly city: string;
      readonly state: State;
      readonly mainLocation: Coords;
    }

    export interface ExtendedAddress extends Address {
      readonly geometry: [Coords, Coords];
      readonly leftZipCode: string;
      readonly rightZipCode: string;
      readonly leftFirstNumber: number;
      readonly leftLastNumber: number;
      readonly rightFirstNumber: number;
      readonly rightLastNumber: number;
    }
  }
}
