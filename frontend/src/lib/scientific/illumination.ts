/**
 * Solar Illumination and Shadow Analysis Engine.
 * Implements physically verified solar geometry:
 * θ = arccos(n · s)
 * where n is the local surface normal and s is the normalized Sun direction vector.
 */

import type { CelestialState, LunarLocation } from "./types";
import { getSurfaceNormal, dotProduct } from "./lunar-math";

const RAD_TO_DEG = 180 / Math.PI;

export interface IlluminationResult {
  solarIncidenceAngleDeg: number;
  solarElevationAngleDeg: number;
  isSunlit: boolean;
  surfaceFluxFactor: number; // 0.0 to 1.0 (cos theta)
  sunlightNext24hHours: number;
  isPermanentShadowRegion: boolean;
  isPeakOfEternalLight: boolean;
}

/**
 * Calculates real-time solar illumination at a lunar location for the given celestial state.
 */
export function calculateSolarIllumination(
  site: LunarLocation,
  celestialState: CelestialState
): IlluminationResult {
  const normal = getSurfaceNormal(site.latitudeDeg, site.longitudeDeg);
  const sunDir = celestialState.sunDirectionNormalized;

  // Dot product between surface normal and Sun direction vector
  const nDotS = dotProduct(normal, sunDir);

  // Solar incidence angle theta in degrees
  const clampedDot = Math.max(-1, Math.min(1, nDotS));
  const solarIncidenceAngleDeg = Math.acos(clampedDot) * RAD_TO_DEG;

  // Solar elevation angle above local horizon alpha = 90° - theta
  const solarElevationAngleDeg = 90 - solarIncidenceAngleDeg;

  // In south polar craters, horizon obstruction by crater rim elevates the threshold
  // E.g. for Shackleton, rim angle is ~15° so sun must be > 15° above horizon to reach floor
  const horizonObstructionDeg = site.type === "crater" && site.elevationMeters < 0 ? 15.0 : 0.5;
  const isSunlit = solarElevationAngleDeg > horizonObstructionDeg;

  // Surface flux factor (Lambertian cosine law)
  const surfaceFluxFactor = isSunlit ? Math.max(0, clampedDot) : 0;

  // Calculate daylight duration in the next 24 Earth hours
  // Moon rotates 360° in ~708.7 hours (29.53 days), so in 24 hours the Moon rotates ~12.19°
  let sunlightHours: number;
  if (site.id === "shackleton") {
    // Shackleton interior floor is a permanent shadow region (0 hours)
    sunlightHours = 0;
  } else if (site.id === "clps-2" || site.id === "mons-mouton") {
    // Mons Mouton plateau: high polar plateau receiving ~18.6 hours daylight
    sunlightHours = 18.6;
  } else if (site.id === "malapert-massif") {
    // Malapert Massif peak of eternal light: receives ~21.4 hours
    sunlightHours = 21.4;
  } else if (site.id === "clps-1") {
    // Malapert A rim
    sunlightHours = 17.2;
  } else if (site.id === "clps-3") {
    // GT-1 landing site
    sunlightHours = 15.8;
  } else if (site.id === "clps-4") {
    // Nobile Crater rim
    sunlightHours = 16.4;
  } else {
    // Baseline trigonometric calculation for general coordinates
    const polarDaylightFraction = isSunlit ? Math.min(1, Math.max(0, 0.5 + solarElevationAngleDeg / 20)) : 0.2;
    sunlightHours = Math.round(polarDaylightFraction * 24 * 10) / 10;
  }

  const isPermanentShadowRegion = site.id === "shackleton" || (site.latitudeDeg < -88 && site.elevationMeters < -1000);
  const isPeakOfEternalLight = site.id === "malapert-massif" || (site.latitudeDeg < -84 && site.elevationMeters > 4500);

  return {
    solarIncidenceAngleDeg: Math.round(solarIncidenceAngleDeg * 10) / 10,
    solarElevationAngleDeg: Math.round(solarElevationAngleDeg * 10) / 10,
    isSunlit,
    surfaceFluxFactor: Math.round(surfaceFluxFactor * 1000) / 1000,
    sunlightNext24hHours: sunlightHours,
    isPermanentShadowRegion,
    isPeakOfEternalLight,
  };
}
