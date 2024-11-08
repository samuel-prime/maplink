import type { _Planning } from "./types";

export class ProblemBuilder {
  readonly problem = new Problem();

  legislationProfiles<T extends string>(data: _Planning.Problem.LegislationProfile<T>[]) {
    this.problem.legislationProfiles.push(...data);
    return this as this & { problem: Problem<T, any, any, any, any, any, any, any> };
  }

  logisticConstraints<T extends string>(data: _Planning.Problem.LogisticConstraint<T>[]) {
    this.problem.logisticConstraints.push(...data);
    return this;
  }

  logisticZones<T extends string>(data: _Planning.Problem.LogisticZone<T>[]) {
    this.problem.logisticZones ??= [];
    this.problem.logisticZones.push(...data);
    return this;
  }

  vehicleTypes<T extends string>(data: _Planning.Problem.VehicleType<T>[]) {
    this.problem.vehicleTypes.push(...data);
    return this;
  }

  build() {
    return this.problem;
  }
}

export class Problem<
  LP extends string,
  LC extends string,
  LZ extends string,
  VT extends string,
  V extends string,
  D extends string,
  S extends string,
  P extends string,
> {
  readonly startDate: number = Date.now();
  readonly legislationProfiles: _Planning.Problem.LegislationProfile<LP>[] = [];
  readonly logisticConstraints: _Planning.Problem.LogisticConstraint<LC>[] = [];
  logisticZones?: _Planning.Problem.LogisticZone<LZ>[];
  readonly vehicleTypes: _Planning.Problem.VehicleType<VT>[] = [];
  readonly vehicles: _Planning.Problem.Vehicle<V, VT, LZ, LP>[] = [];
  readonly depots: _Planning.Problem.Site<D, LZ, LC>[] = [];
  readonly sites: _Planning.Problem.Site<S, LZ, LC>[] = [];
  readonly products: _Planning.Problem.Product<P>[] = [];
  readonly operations: _Planning.Problem.Operation<P, D, S, V>[] = [];
  trip?: _Planning.Problem.Trip;
  restrictionZones?: _Planning.Problem.RestrictionZones;
  calculationMode?: _Planning.Problem.CalculationMode;
  tripsProfile: _Planning.Problem.TripsProfile = "MAPLINKBR";
  optimizationProfile: _Planning.Problem.OptimizationProfile = "BRAZIL37";
}
