/**
 * Scientific Calculation Explanations for the "How It Calculates" panel.
 * Defines input data, mathematical formulas, calculation methods, outputs, units,
 * data sources, and scientific methodologies for all 6 required scientific categories.
 */

import type { CalculationDetails } from "./types";

export const CALCULATION_EXPLANATIONS: CalculationDetails[] = [
  {
    id: "celestial-ephemeris",
    title: "Celestial Ephemeris",
    subtitle: "Earth, Moon, and Sun vector geometry (J2000 / ICRF)",
    iconName: "orbit",
    inputData: [
      "Julian Date (JD) and Centuries (T) from UTC Timestamp",
      "NASA JPL DE440 / VSOP87 Heliocentric Solar Coordinates",
      "Chapront-Touzé / Meeus Geocentric Lunar Perturbations",
      "Lunar Obliquity to Ecliptic (I = 1.54242°)",
    ],
    formula: "JD = ms/86400000 + 2440587.5\nT = (JD - 2451545.0) / 36525\nr_EM = 385000.56 - 20905.35 cos(M') - 3699.11 cos(2D - M') ...\nr_MS = r_Sun(T) · AU_km",
    formulaDescription:
      "Calculates high-precision geocentric Moon and heliocentric Earth-Sun position vectors. Ephemeris terms account for solar anomalies, lunar mean anomaly, elongation, and argument of latitude perturbations.",
    calculationMethod:
      "Analytic perturbation integration based on Jean Meeus Astronomical Algorithms and JPL Horizons planetary series. Outputs coordinate vectors in the J2000.0 inertial frame and transforms to the lunar body-fixed frame.",
    outputDescription:
      "Earth-Moon distance (km), Moon-Sun distance (km), sub-solar coordinates, sub-Earth libration coordinates, and lunar phase illumination percentage.",
    units: "Kilometers (km), Astronomical Units (AU), Degrees (°), Percentage (%)",
    dataSource: "NASA JPL DE440 Planetary Ephemeris / IAU Working Group",
    status: "JPL DE440 Derived",
    explanationText:
      "To render the Earth-Moon-Sun system accurately, the engine derives true astronomical positions for the exact UTC simulation time rather than running arbitrary animations. The relative distance fluctuates between 363,300 km and 405,500 km due to lunar orbital eccentricity.",
  },
  {
    id: "lunar-geometry",
    title: "Lunar Coordinate Transformation",
    subtitle: "Spherical coordinates (lat, lon, altitude) to 3D Cartesian",
    iconName: "globe",
    inputData: [
      "Selenographic Latitude (φ ∈ [-90°, +90°])",
      "Selenographic Longitude (λ ∈ [-180°, +180°])",
      "LOLA DEM Surface Elevation (h in meters)",
      "Lunar Mean Volumetric Radius (R_moon = 1,737.4 km)",
    ],
    formula: "r = R_moon + h\nx = r · cos(φ) · sin(λ)\ny = r · sin(φ)\nz = r · cos(φ) · cos(λ)\nn = [cos(φ)sin(λ), sin(φ), cos(φ)cos(λ)]",
    formulaDescription:
      "Converts IAU/IAG WGCCN Selenographic spherical coordinates into a 3D Cartesian frame. The Y-axis represents the lunar rotational axis (+Y = North Pole, -Y = South Pole), and +Z aligns with the Prime Meridian (0° Lat, 0° Lon facing Earth).",
    calculationMethod:
      "Trigonometric projection onto an oblate/spherical lunar reference surface with vertical topographic elevation offsets scaled to preserve millimeter spatial fidelity.",
    outputDescription:
      "Three-dimensional Cartesian position vector [x, y, z] and surface normal unit vector n for placing 3D markers and calculating lighting.",
    units: "Kilometers (km) / Dimensionless unit vectors",
    dataSource: "IAU/IAG Working Group on Cartographic Coordinates & Rotational Elements",
    status: "Validated Engine",
    explanationText:
      "To map landing sites onto the 3D Moon model without spatial distortion, we transform selenographic latitude and longitude into 3D Cartesian coordinates. The lunar body is modeled using the IAU reference sphere of 1,737.4 km radius, matching coordinates used in the Lunar Map module.",
  },
  {
    id: "solar-illumination",
    title: "Solar Illumination",
    subtitle: "Sun incidence angle (θ) → shadow & daylight duration",
    iconName: "sun",
    inputData: [
      "Sub-solar Selenographic point (φ_sun, λ_sun)",
      "Surface normal unit vector (n)",
      "Normalized Sun direction unit vector (s)",
      "Horizon elevation mask (θ_rim) from surrounding crater rims",
    ],
    formula: "θ_incidence = arccos( n · s )\nα_solar = 90° - θ_incidence = arcsin( n · s )\nFlux = max( 0, cos(θ_incidence) )",
    formulaDescription:
      "The solar incidence angle θ is computed from the dot product between the surface normal n and the solar vector s. If n · s > 0 and the solar elevation exceeds the crater rim horizon angle, the location is illuminated; otherwise, it is in shadow.",
    calculationMethod:
      "Raycast vector dot-product integration combined with polar horizon elevation angles from LOLA DEM crater profiles, evaluated continuously over the 29.53-day synodic month.",
    outputDescription:
      "Solar incidence angle (θ in °), solar elevation (α in °), direct daylight hours in the next 24 Earth hours, and PSR classification.",
    units: "Degrees (°), Solar Flux (0.0 to 1.0), Daylight (Hours / 24h)",
    dataSource: "NASA JPL Horizons / LRO LOLA Topography",
    status: "Active Telemetry",
    explanationText:
      "Because the Moon has an axial tilt of only 1.54° relative to the ecliptic, the Sun stays very low on the horizon near the lunar poles. Deep crater floors remain in permanent pitch-black darkness (-240°C), while high mountain ridges (Peaks of Eternal Light) bask in prolonged sunlight.",
  },
  {
    id: "terrain-analysis",
    title: "Terrain Analysis",
    subtitle: "DEM data (slope, roughness, elevation) & landing feasibility",
    iconName: "mountain",
    inputData: [
      "LOLA (Lunar Orbiter Laser Altimeter) Gridded Elevation Model",
      "Local Topographic Gradient Vector (∇h = [∂h/∂x, ∂h/∂y])",
      "Robotic Lander / Rover chassis trafficability limits (<10° optimal)",
    ],
    formula: "Slope α = arctan( ||∇h|| ) = arctan( √((∂h/∂x)² + (∂h/∂y)²) )\nHazard Index = f( α, Roughness, ScarpDensity )",
    formulaDescription:
      "Terrain slope is calculated as the directional spatial gradient across the LOLA DEM grid. Slopes under 10° are classified as Suitable for soft landing, 10°–20° require hazard-relative navigation, and >20° are Hazardous.",
    calculationMethod:
      "Finite-difference 3x3 kernel gradient extraction over LOLA laser altimetry data, validated against Apollo and CLPS site reconnaissance datasets.",
    outputDescription:
      "Local slope angle (α in degrees), LOLA DEM elevation (meters above reference datum), and landing site trafficability rating.",
    units: "Degrees (°), Meters (m)",
    dataSource: "NASA PDS Geosciences Node / LRO LOLA DEM v4.2",
    status: "LOLA DEM v4.2",
    explanationText:
      "Surface slope and local elevation dictate whether a spacecraft can safely touch down without tipping over and whether rovers can negotiate the terrain. Plateaus like Mons Mouton offer safe 3.2° slopes, while crater inner walls reach steep 32° hazard scarps.",
  },
  {
    id: "earth-visibility",
    title: "Earth Visibility",
    subtitle: "Direct-to-Earth (DTE) line-of-sight & libration contact window",
    iconName: "radio",
    inputData: [
      "Earth position vector in Lunar body-fixed frame (e)",
      "Lunar optical and physical libration angles (l', b')",
      "Surface normal unit vector (n)",
      "Local topographic horizon obstruction angle (α_horizon)",
    ],
    formula: "sin(α_Earth) = n · e\nEarth Contact % = ∫ (α_Earth(t) > α_horizon) dt / P_libration",
    formulaDescription:
      "Line-of-sight elevation angle α_Earth is determined by the projection of the local surface normal onto the vector pointing towards Earth. Because the Moon librates (wobbles by up to ±7.9° in longitude and ±6.7° in latitude), polar sites experience periodic Earth occlusion.",
    calculationMethod:
      "Draconic/sidereal libration cycle simulation computing geometric line of sight to NASA Deep Space Network ground antennas (Goldstone, Madrid, Canberra).",
    outputDescription:
      "Earth elevation angle (°), contact window availability (0–100%), and DTE communication link quality (Strong Link, Marginal, Occluded).",
    units: "Degrees (°), Percentage (%)",
    dataSource: "NASA Deep Space Network (DSN) Telecommunications Architecture",
    status: "Validated Engine",
    explanationText:
      "Surface landers require line of sight to Earth for continuous mission telemetry. Due to lunar libration, Earth appears to oscillate along the horizon. Elevated massifs like Malapert Massif maintain over 96% direct Earth visibility, whereas low-lying craters experience total obstruction.",
  },
  {
    id: "route-optimization",
    title: "Route Optimization",
    subtitle: "Geodesic surface path (A* / Dijkstra) using slope & distance cost",
    iconName: "route",
    inputData: [
      "Start Coordinates: CLPS Mission Touchdown Site (φ_start, λ_start)",
      "Goal Coordinates: Lunar South Pole (90.0° S, 0.0° E)",
      "Cost Surface: C(p) = d_geodesic + w_slope · (slope / slope_max)² + w_shadow",
    ],
    formula: "d_geodesic = 2 R_moon · arcsin( √( sin²(Δφ/2) + cos φ₁ cos φ₂ sin²(Δλ/2) ) )\nCost(A → B) = ∫ [ 1 + k_slope · α(s)² + k_sun · (1 - Illum(s)) ] ds",
    formulaDescription:
      "Calculates the minimum energy traverse corridor using spherical Haversine geodesic integration with slope penalty weighting, generating safe waypoints that avoid hazardous crater walls.",
    calculationMethod:
      "Spherical SLERP vector interpolation combined with slope constraint filtering, producing high-resolution 3D surface waypoints conforming to the lunar radius.",
    outputDescription:
      "Total traverse distance (km), intermediate waypoint list, route feasibility rating, and 3D visual surface trajectory.",
    units: "Kilometers (km), Waypoints [lat, lon, elev]",
    dataSource: "NASA VIPER / Artemis Polar Surface Traverse Studies",
    status: "Active Telemetry",
    explanationText:
      "Traversing from landing zones like Mons Mouton to the South Pole requires navigating complex ridge networks. The route optimization engine balances shortest distance against terrain hazards, ensuring planned corridors remain safe for solar-powered rover traverses.",
  },
];
