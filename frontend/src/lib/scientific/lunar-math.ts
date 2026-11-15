/**
 * Lunar Mathematical and Coordinate Transformations.
 * Reference standard: IAU/IAG WGCCN Selenographic Reference Frame.
 * Mean Lunar Radius: R_moon = 1,737.4 km.
 */

export const LUNAR_MEAN_RADIUS_KM = 1737.4;
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Converts Selenographic coordinates (Lat, Lon, Elevation) to 3D Cartesian coordinates.
 * In the visualization space:
 * - Y axis: Lunar North Pole (+90° Lat)
 * - -Y axis: Lunar South Pole (-90° Lat)
 * - +Z axis: Selenographic Prime Meridian (0° Lat, 0° Lon)
 * - +X axis: 90° East Longitude
 *
 * @param latDeg Latitude in degrees [-90, +90]
 * @param lonDeg Longitude in degrees [-180, +180]
 * @param sphereRadius The radius in Three.js world units (e.g. 2.0 or 1.0)
 * @param elevationMeters Optional altitude in meters (scaled realistically)
 */
export function selenographicToCartesian(
  latDeg: number,
  lonDeg: number,
  sphereRadius: number = 2.0,
  elevationMeters: number = 0
): [number, number, number] {
  const phi = latDeg * DEG_TO_RAD;
  const lambda = lonDeg * DEG_TO_RAD;

  // Scale elevation in meters to visual radius units (1737.4 km = sphereRadius)
  const visualElevation = (elevationMeters / 1000 / LUNAR_MEAN_RADIUS_KM) * sphereRadius * 3.0; // Subtle exaggeration for visual clarity
  const r = sphereRadius + visualElevation;

  const x = r * Math.cos(phi) * Math.sin(lambda);
  const y = r * Math.sin(phi);
  const z = r * Math.cos(phi) * Math.cos(lambda);

  return [x, y, z];
}

/**
 * Calculates the normalized surface normal vector at any Selenographic point.
 */
export function getSurfaceNormal(latDeg: number, lonDeg: number): [number, number, number] {
  const phi = latDeg * DEG_TO_RAD;
  const lambda = lonDeg * DEG_TO_RAD;

  const nx = Math.cos(phi) * Math.sin(lambda);
  const ny = Math.sin(phi);
  const nz = Math.cos(phi) * Math.cos(lambda);

  return [nx, ny, nz];
}

/**
 * Computes great-circle geodesic distance in kilometers between two lunar locations.
 * Uses the spherical Haversine formula on R_moon = 1,737.4 km.
 */
export function calculateGeodesicDistanceKm(
  lat1Deg: number,
  lon1Deg: number,
  lat2Deg: number,
  lon2Deg: number
): number {
  const phi1 = lat1Deg * DEG_TO_RAD;
  const phi2 = lat2Deg * DEG_TO_RAD;
  const deltaPhi = (lat2Deg - lat1Deg) * DEG_TO_RAD;
  const deltaLambda = (lon2Deg - lon1Deg) * DEG_TO_RAD;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  return LUNAR_MEAN_RADIUS_KM * c;
}

/**
 * Generates an array of 3D Cartesian coordinates tracing a geodesic surface arc.
 */
export function generateGeodesicArc(
  lat1Deg: number,
  lon1Deg: number,
  lat2Deg: number,
  lon2Deg: number,
  sphereRadius: number = 2.0,
  steps: number = 24,
  offsetAboveSurface: number = 0.015
): [number, number, number][] {
  const points: [number, number, number][] = [];
  const p1 = selenographicToCartesian(lat1Deg, lon1Deg, 1.0);
  const p2 = selenographicToCartesian(lat2Deg, lon2Deg, 1.0);

  // Vector SLERP across the sphere
  const v1 = [p1[0], p1[1], p1[2]];
  const v2 = [p2[0], p2[1], p2[2]];

  const dot = Math.max(-1, Math.min(1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]));
  const omega = Math.acos(dot);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let pt: [number, number, number];

    if (omega < 0.001) {
      pt = [
        v1[0] * (1 - t) + v2[0] * t,
        v1[1] * (1 - t) + v2[1] * t,
        v1[2] * (1 - t) + v2[2] * t,
      ];
    } else {
      const sinOmega = Math.sin(omega);
      const s1 = Math.sin((1 - t) * omega) / sinOmega;
      const s2 = Math.sin(t * omega) / sinOmega;
      pt = [
        v1[0] * s1 + v2[0] * s2,
        v1[1] * s1 + v2[1] * s2,
        v1[2] * s1 + v2[2] * s2,
      ];
    }

    const len = Math.hypot(pt[0], pt[1], pt[2]) || 1;
    const r = sphereRadius + offsetAboveSurface;
    points.push([(pt[0] / len) * r, (pt[1] / len) * r, (pt[2] / len) * r]);
  }

  return points;
}

/**
 * Calculates dot product of two 3D vectors.
 */
export function dotProduct(a: [number, number, number], b: [number, number, number]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Calculates the angle between two 3D vectors in degrees.
 */
export function angleBetweenVectorsDeg(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const dot = dotProduct(a, b);
  const magA = Math.hypot(a[0], a[1], a[2]);
  const magB = Math.hypot(b[0], b[1], b[2]);
  if (magA === 0 || magB === 0) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot / (magA * magB)));
  return Math.acos(cosTheta) * RAD_TO_DEG;
}
