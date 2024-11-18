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
    export type StartDate = number;
    export type CalculationMode = "THE_FASTEST" | "THE_SHORTEST";
    export type TripsProfile = "MAPLINKBR" | "MAPLINK" | "LINEAR";
    export type OptimizationProfile = "BRAZIL37" | "BRAZIL46" | "BRAZIL_AVG_LOAD_RATE" | "BRAZIL_VRP_PICKUP";

    export interface LegislationProfile<T> {
      name: T;
      drivingPauseDuration?: number;
      workingPauseDuration?: number;
      maxContinuousDrivingTime?: number;
      maxContinuousWorkingTime?: number;
    }

    export interface LogisticZone<T> {
      name: T;
      zonePriority: ZonePriority;
    }

    type ZonePriority = "PRIORITARY" | "SECUNDARY";
    type PositionInRoute = "INDIFFERENT" | "FIRST" | "LAST" | "ALONE";

    export interface LogisticConstraint<T> {
      name: T;
      loadingMaxSize?: number;
      unloadingMaxSize?: number;
      siteLoadingFixedTime?: number;
      siteUnloadingFixedTime?: number;
      loadingPositionInRoute?: PositionInRoute;
      unloadingPositionInRoute?: PositionInRoute;
    }

    type CompartmentsAccessMode = "ALL_COMPARTMENTS" | "REAR_ACCESS";
    type LoadingRule =
      | "NONE"
      | "SINGLE_OPERATION"
      | "IDENTICAL_PRODUCTS"
      | "IDENTICAL_PACKAGINGS"
      | "IDENTICAL_SITE_PRODUCTS";

    interface Compartment {
      name: string;
      increment?: number;
      maximumCapacity: number;
      loadingRule: LoadingRule;
      allowedPackagings?: string[];
    }

    export interface VehicleType<T> {
      name: T;
      characteristics?: string;
      size: number;
      maxWeight: number;
      maxVolume: number;
      maxSitesNumber?: number;
      minAvaibleCapacityForCollection?: number;
      compartmentsAccessMode?: CompartmentsAccessMode;
      compartmentConfigurations?: Array<{ name: string; compartments: Compartment[] }>;
      trip?: Trip;
    }

    export interface Site<T, LZ, LC> {
      name: T;
      logisticZones?: LZ;
      logisticConstraints: LC;
      coordinates: Coordinates;
    }

    interface AvailablePeriod {
      arrivalSite?: string;
      departureSite?: string;
      timeWindow: TimeWindow;
      maxRoutesNumber?: number;
    }

    export interface Vehicle<T, VT, LZ, LP> {
      name: T;
      vehicleType: VT;
      logisticZones?: LZ;
      legislationProfile?: LP;
      availablePeriods: AvailablePeriod[];
    }

    export interface Product<T> {
      name: T;
      type?: string;
      packagings?: string[];
    }

    type OperationType = "DELIVERY" | "COLLECTION";

    export interface Operation<P, D, S, V> {
      id: string;
      type: OperationType;
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
  }

  export namespace Solution {
    type ActivityName = "ROUTE_START" | "LOADING" | "DRIVING" | "DELIVERY" | "ROUTE_END";
    type ActivityType = "SITE" | "DRIVING";

    export interface Activity {
      activity: ActivityName;
      timeWindow: TimeWindow;
      type: ActivityType;
      site?: string;
      operations: string[];
      fixedTimeSite?: number;
      arrivalSite?: string;
      departureSite?: string;
      distance?: number;
      nominalDuration?: number;
    }

    export interface Route {
      id: string;
      activities: Activity[];
      status: null;
      violationConstraints: null;
      compartmentConfiguration: null;
    }

    export interface VehicleRoutePeriod {
      timeWindow: TimeWindow;
      departureSite: string;
      arrivalSite: string;
      maxRoutesNumber: number;
      maxWorkingTime: null;
      maxDrivingTime: null;
    }

    export interface VehicleRoute {
      vehicle: string;
      routes: Route[];
      period: VehicleRoutePeriod;
    }

    export interface Indicators {
      totalServiceTime: number;
      totalDeliveringTime: number;
      dayWorkingTotalTime: number;
      nightWorkingTotalTime: number;
      totalUnloadingTime: number;
      totalWorkingTime: number;
      totalCollectingTime: number;
      timeWindowNumber: number;
      totalDrivingTime: number;
      totalLoadingTime: number;
      totalTime: number;
      totalDistance: number;
      averageOccupancyRateVolume: number;
      averageOccupancyRateWeight: number;
      rejectOperationsNumber: number;
      totalWaitingTime: number;
      totalRestTime: number;
      routesNumber: number;
    }

    export type RejectionCodes = keyof RejectionCauses;
    export type RejectionMessage<K extends RejectionCodes = RejectionCodes> = RejectionCauses[K];

    interface PossibleRejectionCause<K extends RejectionCodes> {
      code: K;
      message: RejectionMessage<K>;
    }

    export type Data = {
      id: string;
      clientId: string;
      vehicleRoutes: VehicleRoute[];
      rejectOperations: string[];
      possibleCausesOfRejectOperaions?: Partial<Record<string, PossibleRejectionCause<RejectionCodes>[]>>;
      indicators: Indicators;
    };

    interface RejectionCauses {
      DEP0001: `The operation [${string}] of site [${string}] must be alone in is route.`;
      DEP0002: `The operation [${string}] of site [${string}] must be at the beginning of a route.`;
      DEP0003: `The operation [${string}] of site [${string}] must be at the end of a route.`;
      DEP0004: `The operation [${string}] of site [${string}] not have the same batch number of is route.`;
      DEP0005: `Loading on site [${string}] of operation [${string}] must be at the beginning of route.`;
      DEP0006: `Multi-loading not allowed.`;
      DEP0007: `Unloading on site [${string}] of operation [${string}] must be at the end of a route.`;
      DEP0008: `Multi-unloading is not allowed.`;
      DEP0009: `Failure of the reverse order loading/delivery (or collection/unloading): parameter 1246.`;
      DEP0010: `There are two operations linked to the same PTO [${string}] of site [${string}] in the route.`;
      DEP0011: `The operation [${string}] of site [${string}] does not respect the fact that every operation from the same PTO must be consecutive.`;
      DEP0012: `The size requirement of operation [${string}] of site [${string}] is not compatible with size of truck (${string} / ${string}).`;
      DEP0013: `The characteristic requirement of operation [${string}] of site [${string}] is not compatible with characteristic of truck.`;
      DEP0014: `The site''s weight limit of [${string}] is not respected.`;
      DEP0015: `The weight limit of truck is not respected.`;
      DEP0016: `The volume limit of truck is not respected.`;
      DEP0017: `The collect threshold of truck is not respected.`;
      DEP0018: `Exceeding the maximum number of routes on truck.`;
      DEP0019: `There is no compatible time window with operations of the route.`;
      DEP0020: `The operation [${string}] is not compatible with truck.`;
      DEP0021: `The volume requirement for truck with trailer [${string}] is not respected.`;
      DEP0022: `The weight requirement for truck with trailer [${string}] is not respected.`;
      DEP0023: `The trailer [${string}] is not compatible with truck.`;
      DEP0024: `The operation [${string}] of site [${string}] does not respect the frequency of the site.`;
      DEP0025: `The additional delivery of operation [${string}] on site [${string}] is outside the required time windows.`;
      DEP0026: `The maximum number of available docks on site [${string}] (Operation [${string}]) is not respected.`;
      DEP0027: `Exceeding the maximum number of trucks traveling simultaneously.`;
      DEP0028: `Excessive waiting time.`;
      DEP0029: `Exceeding the maximum driving time.`;
      DEP0030: `Exceeding the maximum working time.`;
      DEP0031: `Exceeding the maximum amplitude.`;
      DEP0032: `The route scheduling required a long break which is prohibited.`;
      DEP0033: `The maximum driving time to trigger the stop [${string}] is exceeded.`;
      DEP0034: `The maximum working time to trigger the stop [${string}] is exceeded.`;
      DEP0035: `The minimum driving time to trigger the stop [${string}] is not reached.`;
      DEP0036: `The minimum working time to trigger the stop [${string}] is not reached.`;
      DEP0037: `Parameter 1221 not respected: maximum gap between the times windows for loading on the route.`;
      DEP0038: `Parameter 5000 not respected: consistency between loading and delivery.`;
      DEP0039: `Not feasible compartment computation.`;
      DEP0040: `There is no feasible assignment of truck to this element.`;
      DEP0041: `The times windows constraints of the operation [${string}] on its customer site [${string}] cannot be satisfied.`;
      DEP0042: `Overtaking the end of the time window.`;
      DEP0043: `The operation [${string}] of site [${string}] have no time windows compatibles with truck.`;
      DEP0044: `End of handling trailer on route [${string}] too late.`;
      DEP0045: `The required zone of operation [${string}] on site [${string}] is not compatible with zones characteristics of truck.`;
      DEP0046: `There is no zone compatible with all vehicle route operations and the truck.`;
      DEP0047: `The operation [${string}] to do on site [${string}] is not compatible with truck in terms of depot profile (depot profile: [${string}]).`;
      DEP0053: `Anticipation shift cannot be respected.`;
      DEP0058: `The operation [${string}] cannot be assign to depot [${string}] (depot [${string}] already assigned).`;
      DEP0059: `The depot profile of operation [${string}] do not allow assignment to depot [${string}].`;
      DEP0069: `The balancing of the trailer types is impossible on the truck.`;
      DEP0070: `The operation [${string}] does not have any time window on its depot.`;
      DEP0071: `The operation [${string}] does not have any time window on its customer site.`;
      DEP0072: `The time windows of stop [${string}] cannot be respected.`;
      DEP0073: `Not feasible trailer handling.`;
      DEP0074: `The times windows constraints of the operation [${string}] on its depot site [${string}] cannot be satisfied.`;
      DEP0075: `The size requirement of operation [${string}] of site [${string}] is not compatible with size of the trailer (${string} / ${string}).`;
      DEP0076: `Incompatibility between operations [${string}] and [${string}] on differents routes.`;
      DEP0077: `The product [${string}] of operation [${string}] is not compatible with the production planning of the depot [${string}].`;
      DEP0078: `The AGVW limit of truck is not respected.`;
      DEP0079: `The times windows constraints of production of line ${string} of site [${string}] are not satisfied by operation [${string}].`;
      DEP0080: `The product [${string}] of operation [${string}] cannot be produced on line ${string} of site [${string} on time windows ${string}`;
      DEP0081: `There is a deficit relative to production need on line ${string} of site [${string}] on time windows ${string} (${string} < ${string}).`;
      DEP0082: `There is an overflow relative to production limit on line ${string} of site [${string}] on time windows ${string} (${string} > ${string}).`;
      DEP0083: `The operations [${string}] and [${string}] are produced simultaneously ${string} on site [${string}].`;
      DEP0084: `Pre-emption of the production of operation [${string}] by a break (${string}) on line ${string} of site [${string}].`;
      DEP0085: `Pre-emption of the production of operation [${string}] by the production of operation [${string} on line ${string} of site [${string}].`;
      DEP0086: `Pre-emption of the production of operation [${string}] by a stop (${string}) on line ${string} of site [${string}].`;
      DEP0087: `On time windows ${string}, there is a deficit relative to certification ${string} need on line ${string} of site [${string}] (${string} < ${string}).`;
      DEP0088: `On time windows ${string}, there is an overflow relative to certification ${string} limit on line ${string} of site [${string}] (${string} > ${string}).`;
      DEP0089: `The operation [${string}] does not satisfy the required certification ${string} on time windows ${string} on line ${string} on site [${string}].`;
      DEP0090: `The operation [${string}] does not satisfy the minimum pre-storage waiting time (${string} < ${string}) on site [${string}].`;
      DEP0091: `The operation [${string}] does not satisfy the maximum pre-storage waiting time (${string} > ${string}) on site [${string}].`;
      DEP0092: `There is no compatibility between time windows (${string}) and the beginning of the production (${string}) of the operation [{1]} on site [${string}].`;
      DEP0093: `On depot [${string}], the production schedule of the operation [${string}] induces one unfulfilled constraint of the capacity constraint of the production's timeslot: ${string} (${string} > ${string}) for the certification ${string}.`;
      DEP0094: `On depot [${string}], the production schedule of the operation [${string}] induces one unfulfilled constraint of the capacity constraint of the production's time slot: ${string} (${string} > ${string}) for the product [${string}].`;
      DEP0095: `The affectation of operation [${string} to depot [${string} induces one unfulfilled constraint of the maximum distance constraint (${string} > ${string}).`;
      DEP0096: `On site [${string}], the passage number ${string} of the operation [${string}] does not have feasible time windows, given the schedules of other passages of the operation.`;
      DEP0097: `On site [${string}], the passage number ${string} of the operation [${string}] does not respect its time windows induced by schedules of other passages of the operation.`;
      DEP0098: `The maximum number of sites of the truck is not satisfied.`;
      DEP0099: `The operation [${string}] is not in the first route.`;
      DEP0100: `The operation [${string}] is not in the final route.`;
      DEP0101: `The timing of some passages of the operation [${string}] is no longer correct.`;
      DEP0102: `The vehicle is not compatible with the pre-allocation of the operation [${string}].`;
      DEP0103: `The operation [${string}] is incompatible with the group [${string}] that occurs in the vehicle activity.`;
      DEP0104: `The predefined production day is not respect by the operation [${string}].`;
      DEP0105: `The quantities of the operation [${string}] on the site [${string}] are not adapted to its time sequencing.`;
      DEP0106: `The stop [${string}] does not respect the constraint about its feasibility at the beginning or the end of a route.`;
      DEP0107: `The route scheduling required a long break which is prohibited by the parametrization (see parameter 1635)`;
      DEP0108: `The route doesn't respect the maximum driving time between the two first visited sites imposed by the parametrization (see parameter 460)`;
      DEP0109: `The route doesn't respect the maximum driving time between the two final visited sites imposed by the parametrization (see parameter 470)`;
      DEP0110: `The operation [${string}] on site [${string}] doesn''t respect the maximum driving time between its site and the vehicle site (see parameter 1203)`;
      DEP0111: `The route doesn't respect the maximum driving time between depots (see parameter 1202)`;
      DEP0112: `The route doesn't respect the maximum driving time between clients' sites (see parameter 1200)`;
      DEP0113: `The route doesn''t respect the maximum handling delay on the operation [${string}] and the site [${string}] (see parameters 1211 et 1212)`;
      DEP0114: `Sites ${string} and ${string} forms an angle with the only depot of the tour that does not satisfies the limit set by parameter 490.`;
      DEP0115: `The route accesses several times to the same customer site (see parameter 1245)`;
      DEP0116: `The route accesses several times to the same loading site (see parameter 1242)`;
      DEP0117: `The route accesses several times to the same unloading site (see parameter 1242)`;
      DEP0118: `The maximum amplitude between the start of the time windows of the main operations is not respected`;
      DEP0119: `Incompatibility between operations [${string}] and [${string}] on the same route.`;
      DEP0120: `Incompatibility between operations [${string}] and [${string}].`;
      DEP0121: `Maximal unloaded ride not respected between routes: parameter 1160.`;
      DEP0122: `Maximal unloaded ride not respected at the beginning of the first route: parameter 1161.`;
      DEP0123: `Maximal unloaded ride not respected at the end of the last route: parameter 1162.`;
      DEP0124: `Incorrect date compared to predecessor operations.`;
      DEP0125: `Incorrect date compared to successor operations.`;
      DEP0126: `Route with loading break.`;
    }
  }

  export namespace Api {
    export interface Error {
      logId: string;
      message: string;
      errors?: string[];
    }
  }
}
