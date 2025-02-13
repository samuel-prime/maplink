export namespace _Trip {
  export interface Request {
    calculationMode: "THE_FASTEST" | "THE_SHORTEST";
    points: { latitude: number; longitude: number; siteId: string }[];
  }

  export interface Response<K extends PointsMode> {
    id: string;
    clientId: string;
    totalDistance: number;
    totalNominalDuration: number;
    averageSpeed: number;
    legs: Leg<K>[];
    source: string;
    createdAt: string;
    expiryIn: string;
  }

  export interface Leg<K extends PointsMode> {
    distance: number;
    nominalDuration: number;
    averageSpeed: number;
    points: Points[K];
  }

  export type PointsMode = keyof Points;

  type Points = {
    object: { latitute: number; longitude: number }[];
    array: [number, number][];
    geohash: string[];
    polyline: string;
  };
}
