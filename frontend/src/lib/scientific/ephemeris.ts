/**
 * Astronomical ephemeris engine for Earth-Moon-Sun geometry.
 * Based on validated astronomical algorithms (Jean Meeus / JPL Horizons simplified ephemeris).
 * Reference Frame: J2000.0 Ecliptic & Lunar Body-Fixed Selenographic coordinates.
 */

import type { CelestialState } from "./types";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function normalizeAngle180(deg: number): number {
  let d = ((deg + 180) % 360) - 180;
  if (d < -180) d += 360;
  return d;
}

/**
 * Calculates high-accuracy Earth, Moon, Sun geometry for any given UTC timestamp.
 */
export function calculateCelestialState(timestampMs: number): CelestialState {
  // Julian Date
  const jd = timestampMs / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525; // Julian centuries from J2000.0
  const T2 = T * T;

  // --- SUN EPHEMERIS (Heliocentric) ---
  // Mean anomaly of the Sun
  const M_sun = normalizeDegrees(357.52911 + 35999.05029 * T - 0.0001537 * T2) * DEG_TO_RAD;
  // Mean longitude of the Sun
  const L0 = normalizeDegrees(280.46646 + 36000.76983 * T + 0.0003032 * T2);
  // Equation of the center
  const C_sun =
    (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(M_sun) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M_sun) +
    0.000289 * Math.sin(3 * M_sun);
  // Sun true longitude
  const lambda_sun = normalizeDegrees(L0 + C_sun) * DEG_TO_RAD;

  // Sun-Earth distance in AU
  const e_sun = 0.016708634 - 0.000042037 * T;
  const v_sun = M_sun + C_sun * DEG_TO_RAD;
  const r_sun_au = (1.000001018 * (1 - e_sun * e_sun)) / (1 + e_sun * Math.cos(v_sun));
  const sunMoonDistanceKm = r_sun_au * 149597870.7; // ~149.6M km

  // --- MOON EPHEMERIS (Geocentric) ---
  // Lunar mean longitude
  const L_moon = normalizeDegrees(218.3164477 + 481267.88123421 * T - 0.0015786 * T2);
  // Mean elongation of the Moon
  const D_moon = normalizeDegrees(297.8501921 + 445267.1142204 * T - 0.0018819 * T2) * DEG_TO_RAD;
  // Moon mean anomaly
  const M_moon = normalizeDegrees(134.9633964 + 477198.8675055 * T + 0.0087414 * T2) * DEG_TO_RAD;
  // Moon argument of latitude
  const F_moon = normalizeDegrees(93.272095 + 483202.0175233 * T - 0.0036539 * T2) * DEG_TO_RAD;

  // Longitudinal perturbation (degrees)
  const delta_lambda_moon =
    6.288774 * Math.sin(M_moon) +
    1.274027 * Math.sin(2 * D_moon - M_moon) +
    0.658314 * Math.sin(2 * D_moon) +
    0.213618 * Math.sin(2 * M_moon) -
    0.185116 * Math.sin(M_sun) -
    0.114332 * Math.sin(2 * F_moon) +
    0.058793 * Math.sin(2 * D_moon - 2 * M_moon) +
    0.057066 * Math.sin(2 * D_moon - M_sun - M_moon) +
    0.05332 * Math.sin(2 * D_moon + M_moon) +
    0.045758 * Math.sin(2 * D_moon - M_sun);

  // Latitudinal perturbation (degrees)
  const delta_beta_moon =
    5.128178 * Math.sin(F_moon) +
    0.280602 * Math.sin(M_moon + F_moon) +
    0.277693 * Math.sin(M_moon - F_moon) +
    0.173238 * Math.sin(2 * D_moon - F_moon) +
    0.055413 * Math.sin(2 * D_moon - M_moon + F_moon) +
    0.046271 * Math.sin(2 * D_moon - M_moon - F_moon);

  // Distance perturbation (km)
  const earthMoonDistanceKm =
    385000.56 -
    20905.355 * Math.cos(M_moon) -
    3699.111 * Math.cos(2 * D_moon - M_moon) -
    2955.968 * Math.cos(2 * D_moon) -
    569.925 * Math.cos(2 * M_moon) +
    48.888 * Math.cos(M_sun) -
    3.149 * Math.cos(2 * F_moon);

  const lambda_moon_rad = normalizeDegrees(L_moon + delta_lambda_moon) * DEG_TO_RAD;
  const beta_moon_rad = delta_beta_moon * DEG_TO_RAD;

  // --- LUNAR SELENOGRAPHIC ORIENTATION & LIBRATION ---
  // Moon inclination to ecliptic i = 1° 32' 32.7" = 1.54242°
  const I_inclination = 1.54242 * DEG_TO_RAD;
  const Omega_node = normalizeDegrees(125.04452 - 1934.136261 * T) * DEG_TO_RAD;

  // Sub-Earth optical libration (degrees)
  // Optical libration in longitude l' and latitude b'
  const W = normalizeDegrees(lambda_moon_rad * RAD_TO_DEG - Omega_node * RAD_TO_DEG) * DEG_TO_RAD;
  const sin_b_prime = -Math.sin(W) * Math.cos(beta_moon_rad) * Math.sin(I_inclination) + Math.sin(beta_moon_rad) * Math.cos(I_inclination);
  const subEarthLatitudeDeg = Math.asin(Math.max(-1, Math.min(1, sin_b_prime))) * RAD_TO_DEG;

  // Optical libration in longitude (mean libration amplitude ~7.9°)
  const subEarthLongitudeDeg = normalizeAngle180(
    -Math.sin(M_moon) * 6.289 +
    Math.sin(2 * D_moon - M_moon) * 1.274 -
    Math.sin(2 * D_moon) * 0.658
  );

  // Sub-Solar point on Moon (Selenographic coordinates of the Sun)
  // The Sun's selenographic longitude advances ~360° per synodic month (~29.530589 days)
  const synodicMonthDays = 29.530588861;
  const daysSinceEpoch = (timestampMs - Date.UTC(2026, 0, 1, 0, 0, 0)) / 86400000;
  const phaseCycle = (daysSinceEpoch / synodicMonthDays) % 1;
  // Sub-solar longitude on the lunar surface
  const subSolarLongitudeDeg = normalizeAngle180(180 - phaseCycle * 360);
  // Sub-solar latitude fluctuates between ±1.54° (lunar obliquity to ecliptic)
  const subSolarLatitudeDeg = 1.542 * Math.sin(normalizeDegrees(lambda_sun * RAD_TO_DEG - Omega_node * RAD_TO_DEG) * DEG_TO_RAD);

  // Phase angle psi (Earth - Moon - Sun angle)
  const psi_rad = Math.acos(Math.cos(beta_moon_rad) * Math.cos(lambda_moon_rad - lambda_sun));
  const lunarPhaseAngleDeg = psi_rad * RAD_TO_DEG;
  const illuminationFraction = (1 + Math.cos(psi_rad)) / 2;
  const illuminationPercentage = Math.round(illuminationFraction * 1000) / 10;

  // Calculate 3D unit vectors in lunar-centric frame
  // X: towards (0° Lat, 90° E Lon)
  // Y: towards North Pole (90° N Lat)
  // Z: towards Prime Meridian (0° Lat, 0° Lon - facing Earth)
  const sunLonRad = subSolarLongitudeDeg * DEG_TO_RAD;
  const sunLatRad = subSolarLatitudeDeg * DEG_TO_RAD;
  const sunX = Math.cos(sunLatRad) * Math.sin(sunLonRad);
  const sunY = Math.sin(sunLatRad);
  const sunZ = Math.cos(sunLatRad) * Math.cos(sunLonRad);

  const earthLonRad = subEarthLongitudeDeg * DEG_TO_RAD;
  const earthLatRad = subEarthLatitudeDeg * DEG_TO_RAD;
  const earthX = Math.cos(earthLatRad) * Math.sin(earthLonRad);
  const earthY = Math.sin(earthLatRad);
  const earthZ = Math.cos(earthLatRad) * Math.cos(earthLonRad);

  return {
    timestamp: timestampMs,
    utcDateString: new Date(timestampMs).toISOString().replace("T", " ").substring(0, 19) + " UTC",
    julianDate: Math.round(jd * 100) / 100,
    julianCenturies: Math.round(T * 10000) / 10000,
    earthMoonDistanceKm: Math.round(earthMoonDistanceKm),
    sunMoonDistanceKm: Math.round(sunMoonDistanceKm),
    earthPosition: [earthX * earthMoonDistanceKm, earthY * earthMoonDistanceKm, earthZ * earthMoonDistanceKm],
    sunPosition: [sunX * sunMoonDistanceKm, sunY * sunMoonDistanceKm, sunZ * sunMoonDistanceKm],
    sunDirectionNormalized: [sunX, sunY, sunZ],
    earthDirectionNormalized: [earthX, earthY, earthZ],
    subSolarLatitudeDeg: Math.round(subSolarLatitudeDeg * 100) / 100,
    subSolarLongitudeDeg: Math.round(subSolarLongitudeDeg * 100) / 100,
    subEarthLatitudeDeg: Math.round(subEarthLatitudeDeg * 100) / 100,
    subEarthLongitudeDeg: Math.round(subEarthLongitudeDeg * 100) / 100,
    lunarPhaseAngleDeg: Math.round(lunarPhaseAngleDeg * 10) / 10,
    illuminationPercentage,
  };
}
