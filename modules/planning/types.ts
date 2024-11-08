export namespace _Planning {
  export interface TimeWindow {
    start: number;
    end: number;
  }

  export interface Coordinates {
    latitude: number;
    longitude: number;
  }

  export namespace Problem {
    export interface LegislationProfile<T extends string> {
      name: T;
      drivingPauseDuration?: number;
      workingPauseDuration?: number;
      maxContinuousDrivingTime?: number;
      maxContinuousWorkingTime?: number;
    }

    export interface LogisticZone<T extends string> {
      name: T;
      zonePriority: "PRIORITARY" | "SECUNDARY";
    }

    export interface LogisticConstraint<T extends string> {
      name: T;
      loadingMaxSize?: number;
      unloadingMaxSize?: number;
      siteLoadingFixedTime?: number;
      siteUnloadingFixedTime?: number;
      loadingPositionInRoute?: "INDIFFERENT" | "FIRST" | "LAST" | "ALONE";
      unloadingPositionInRoute?: "INDIFFERENT" | "FIRST" | "LAST" | "ALONE";
    }

    export interface Site<T extends string, LZ extends string, LC extends string> {
      name: T;
      logisticZones?: LZ;
      logisticConstraints: LC;
      coordinates: Coordinates;
    }

    interface Compartment {
      name: string;
      increment?: number;
      maximumCapacity: number;
      allowedPackagings?: string[];
      loadingRule:
        | "NONE"
        | "SINGLE_OPERATION"
        | "IDENTICAL_PRODUCTS"
        | "IDENTICAL_PACKAGINGS"
        | "IDENTICAL_SITE_PRODUCTS";
    }

    export interface VehicleType<T extends string> {
      name: T;
      characteristics?: string;
      size: number;
      maxWeight: number;
      maxVolume: number;
      maxSitesNumber?: number;
      minAvaibleCapacityForCollection?: number;
      compartmentsAccessMode?: "ALL_COMPARTMENTS" | "REAR_ACCESS";
      compartmentConfigurations?: Array<{ name: string; compartments: Compartment[] }>;
      trip?: Trip;
    }

    interface AvailablePeriod {
      arrivalSite?: string;
      departureSite?: string;
      timeWindow: TimeWindow;
      maxRoutesNumber?: number;
    }

    export interface Vehicle<T extends string, VT extends string, LZ extends string, LP extends string> {
      name: T;
      vehicleType: VT;
      logisticZones?: LZ;
      legislationProfile?: LP;
      availablePeriods: AvailablePeriod[];
    }

    export interface Product<T extends string> {
      name: T;
      type?: string;
      packagings?: string[];
    }

    export interface Operation<P extends string, D extends string, S extends string, V extends string> {
      id: string;
      type: "DELIVERY" | "COLLECTION";
      depotSite: D;
      customerSite: S;
      depotTimeWindows?: TimeWindow[];
      customerTimeWindows: TimeWindow[];
      depotHandlingDuration?: number;
      customerHandlingDuration?: number;
      product: P;
      volume: number;
      weight: number;
      group?: string;
      quantity?: number;
      preAllocatedVehicleName?: V;
    }

    export type Trip = any;
    export type RestrictionZones = readonly string[];
    export type CalculationMode = "THE_FASTEST" | "THE_SHORTEST";
    export type TripsProfile = "MAPLINKBR" | "MAPLINK" | "LINEAR";
    export type OptimizationProfile = "BRAZIL37" | "BRAZIL46" | "BRAZIL_AVG_LOAD_RATE" | "BRAZIL_VRP_PICKUP";
  }
}
