import type { NonEmptyArray } from "utils/types";
import type { _Planning } from "./types";

export class PlanningProblemBuilder {
  #block_1?: Block_1;
  #block_2?: Block_2<string, string, string, string>;
  #block_3?: Block_3<string, string, string, string, string, string, string, string>;
  #block_4?: Block_4<string, string, string, string>;
}

class Block_1 {
  constructor(
    readonly startDate: _Planning.Problem.StartDate,
    readonly tripsProfile: _Planning.Problem.TripsProfile,
    readonly optimizationProfile: _Planning.Problem.OptimizationProfile,
    readonly calculationMode?: _Planning.Problem.CalculationMode,
  ) {}
}

class Block_2<LP extends string, LC extends string, VT extends string, LZ extends string> {
  constructor(
    readonly legislationProfiles: NonEmptyArray<_Planning.Problem.LegislationProfile<LP>>,
    readonly logisticConstraints: NonEmptyArray<_Planning.Problem.LogisticConstraint<LC>>,
    readonly vehicleTypes: NonEmptyArray<_Planning.Problem.VehicleType<VT>>,
    readonly logisticZones?: NonEmptyArray<_Planning.Problem.LogisticZone<LZ>>,
  ) {}
}

class Block_3<
  LP extends string,
  LC extends string,
  VT extends string,
  LZ extends string,
  V extends string,
  D extends string,
  S extends string,
  P extends string,
> {
  constructor(
    readonly vehicles: NonEmptyArray<_Planning.Problem.Vehicle<V, VT, LZ, LP>>,
    readonly depots: NonEmptyArray<_Planning.Problem.Site<D, LZ, LC>>,
    readonly sites: NonEmptyArray<_Planning.Problem.Site<S, LZ, LC>>,
    readonly products: NonEmptyArray<_Planning.Problem.Product<P>>,
  ) {}
}

class Block_4<V extends string, D extends string, S extends string, P extends string> {
  constructor(
    readonly operations: NonEmptyArray<_Planning.Problem.Operation<P, D, S, V>>,
    readonly restritionZones?: _Planning.Problem.RestrictionZones,
    readonly trip?: _Planning.Problem.Trip,
  ) {}
}

export class PlanningProblem<
  LP extends string,
  LC extends string,
  VT extends string,
  LZ extends string,
  V extends string,
  D extends string,
  S extends string,
  P extends string,
> {
  readonly startDate: _Planning.Problem.StartDate;
  readonly tripsProfile: _Planning.Problem.TripsProfile;
  readonly optimizationProfile: _Planning.Problem.OptimizationProfile;
  readonly calculationMode?: _Planning.Problem.CalculationMode;
  readonly legislationProfiles: NonEmptyArray<_Planning.Problem.LegislationProfile<LP>>;
  readonly logisticConstraints: NonEmptyArray<_Planning.Problem.LogisticConstraint<LC>>;
  readonly vehicleTypes: NonEmptyArray<_Planning.Problem.VehicleType<VT>>;
  readonly logisticZones?: NonEmptyArray<_Planning.Problem.LogisticZone<LZ>>;
  readonly vehicles: NonEmptyArray<_Planning.Problem.Vehicle<V, VT, LZ, LP>>;
  readonly depots: NonEmptyArray<_Planning.Problem.Site<D, LZ, LC>>;
  readonly sites: NonEmptyArray<_Planning.Problem.Site<S, LZ, LC>>;
  readonly products: NonEmptyArray<_Planning.Problem.Product<P>>;
  readonly operations: NonEmptyArray<_Planning.Problem.Operation<P, D, S, V>>;
  readonly restritionZones?: _Planning.Problem.RestrictionZones;
  readonly trip?: _Planning.Problem.Trip;

  constructor(data: PlanningProblem<LP, LC, VT, LZ, V, D, S, P>) {
    this.startDate = data.startDate;
    this.tripsProfile = data.tripsProfile;
    this.optimizationProfile = data.optimizationProfile;
    this.calculationMode = data.calculationMode;
    this.legislationProfiles = data.legislationProfiles;
    this.logisticConstraints = data.logisticConstraints;
    this.vehicleTypes = data.vehicleTypes;
    this.logisticZones = data.logisticZones;
    this.vehicles = data.vehicles;
    this.depots = data.depots;
    this.sites = data.sites;
    this.products = data.products;
    this.operations = data.operations;
    this.restritionZones = data.restritionZones;
    this.trip = data.trip;
  }
}
