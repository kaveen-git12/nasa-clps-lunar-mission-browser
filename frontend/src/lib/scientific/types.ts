/**
 * Types and interfaces for the NASA CLPS Scientific 3D Visualization Engine.
 * All units, reference frames, and coordinate systems are explicitly defined.
 */

export interface CelestialState {
  timestamp: number; // Unix timestamp in ms
  utcDateString: string;
  julianDate: number;
  julianCenturies: number;
  // Earth-Moon-Sun vectors and distances (km)
  earthMoonDistanceKm: number; // Mean ~384,400 km
  sunMoonDistanceKm: number; // ~149.6M km (1 AU)
  earthPosition: [number, number, number]; // Vector in lunar-centric frame
  sunPosition: [number, number, number]; // Vector in lunar-centric frame
  sunDirectionNormalized: [number, number, number]; // Unit vector towards Sun
  earthDirectionNormalized: [number, number, number]; // Unit vector towards Earth
  // Lunar ephemeris angles
  subSolarLatitudeDeg: number; // Selenographic sub-solar latitude
  subSolarLongitudeDeg: number; // Selenographic sub-solar longitude
  subEarthLatitudeDeg: number; // Optical + physical libration in latitude
  subEarthLongitudeDeg: number; // Optical + physical libration in longitude
  lunarPhaseAngleDeg: number;
  illuminationPercentage: number; // 0 - 100%
}

export interface LunarLocation {
  id: string;
  name: string;
  code: string;
  badgeTone: "purple" | "blue" | "orange" | "green" | "cyan";
  type: "lander" | "rover" | "target-region" | "crater";
  missionName: string;
  landerName: string;
  landingSiteName: string;
  agency: string;
  status: "active" | "planned" | "completed" | "target";
  latitudeDeg: number; // Selenographic Latitude [-90..+90]
  longitudeDeg: number; // Selenographic Longitude [-180..+180]
  elevationMeters: number; // Reference to 1,737.4 km radius datum
  terrainSlopeDeg: number; // Local mean slope from LOLA DEM
  slopeHazard: "Suitable" | "Moderate" | "Hazardous";
  description: string;
}

export interface SiteAnalysis {
  site: LunarLocation;
  // Illumination calculation
  solarIncidenceAngleDeg: number; // theta = arccos(n . s)
  solarElevationAngleDeg: number; // 90° - theta
  isSunlit: boolean;
  sunlightNext24hHours: number; // Hours of daylight in next 24 Earth hours
  isPermanentShadowRegion: boolean;
  isPeakOfEternalLight: boolean;
  // Line of sight to Earth (Direct to Earth - DTE)
  earthElevationAngleDeg: number; // alpha = arcsin(n . e)
  hasDirectEarthVisibility: boolean;
  earthVisibilityPercent: number; // Over lunar sidereal/synodic month
  commLinkQuality: "Strong Link" | "Marginal" | "Occluded";
  // Route to South Pole
  distanceToSouthPoleKm: number; // Great-circle surface distance
  routeFeasibility: "Optimal" | "Feasible" | "High Slope Hazard";
}

export interface VisualizationLayerState {
  missionsAndLanders: boolean;
  landingSites: boolean;
  terrainDEM: boolean;
  illuminationSun: boolean;
  communication: boolean;
}

export interface CalculationDetails {
  id: string;
  title: string;
  subtitle: string;
  iconName: "globe" | "mountain" | "sun" | "route" | "radio" | "orbit";
  inputData: string[];
  formula: string;
  formulaDescription: string;
  calculationMethod: string;
  outputDescription: string;
  units: string;
  dataSource: string;
  status: "Validated Engine" | "Active Telemetry" | "LOLA DEM v4.2" | "JPL DE440 Derived";
  explanationText: string;
}
