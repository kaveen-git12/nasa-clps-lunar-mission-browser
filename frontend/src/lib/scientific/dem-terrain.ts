/**
 * NASA Lunar Reconnaissance Orbiter (LRO) LOLA Digital Elevation Model (DEM) Dataset.
 * Topography, elevation, slope, and trafficability data for lunar south pole & CLPS regions.
 * Vertical Datum: R_moon = 1,737,400 meters sphere.
 */

import type { LunarLocation } from "./types";

export const LUNAR_LANDING_SITES: LunarLocation[] = [
  {
    id: "clps-1",
    name: "CLPS-1 (IM-1 Odysseus)",
    code: "CLPS-1",
    badgeTone: "purple",
    type: "lander",
    missionName: "Intuitive Machines IM-1",
    landerName: "Odysseus (Nova-C)",
    landingSiteName: "Malapert A Crater Rim",
    agency: "NASA / Intuitive Machines",
    status: "completed",
    latitudeDeg: -80.13,
    longitudeDeg: 1.44,
    elevationMeters: 2500,
    terrainSlopeDeg: 4.1,
    slopeHazard: "Suitable",
    description: "First commercial lander on the Moon. Touched down near Malapert A crater in the south polar region.",
  },
  {
    id: "clps-2",
    name: "CLPS-2 (IM-2 Athena)",
    code: "CLPS-2",
    badgeTone: "blue",
    type: "lander",
    missionName: "Intuitive Machines IM-2",
    landerName: "Athena (Nova-C)",
    landingSiteName: "Mons Mouton Plateau",
    agency: "NASA / Intuitive Machines",
    status: "planned",
    latitudeDeg: -84.6,
    longitudeDeg: 31.7,
    elevationMeters: 6100,
    terrainSlopeDeg: 3.2,
    slopeHazard: "Suitable",
    description: "Targeting Mons Mouton plateau near the South Pole to drill for subsurface water ice with the PRIME-1 drill.",
  },
  {
    id: "clps-3",
    name: "CLPS-3 (GT-1)",
    code: "CLPS-3",
    badgeTone: "orange",
    type: "lander",
    missionName: "Firefly Aerospace Blue Ghost 1",
    landerName: "Blue Ghost Lander (GT-1)",
    landingSiteName: "South Pole Highland Reconnaissance",
    agency: "NASA / Firefly Aerospace",
    status: "active",
    latitudeDeg: -82.4,
    longitudeDeg: -22.5,
    elevationMeters: 4200,
    terrainSlopeDeg: 3.8,
    slopeHazard: "Suitable",
    description: "South pole highland reconnaissance landing platform evaluating regolith thermal conductivity and dust mitigation.",
  },
  {
    id: "clps-4",
    name: "CLPS-4 (Future)",
    code: "CLPS-4",
    badgeTone: "green",
    type: "rover",
    missionName: "NASA CLPS Volatiles Delivery",
    landerName: "VIPER Prospector / Griffin",
    landingSiteName: "Nobile Crater Western Rim",
    agency: "NASA / Commercial Partners",
    status: "planned",
    latitudeDeg: -85.2,
    longitudeDeg: 53.5,
    elevationMeters: 3450,
    terrainSlopeDeg: 5.1,
    slopeHazard: "Suitable",
    description: "Autonomous volatiles prospecting platform navigating micro-cold traps on the western rim of Nobile Crater.",
  },
  {
    id: "shackleton",
    name: "Shackleton Crater",
    code: "SHACKLETON",
    badgeTone: "cyan",
    type: "crater",
    missionName: "Artemis Polar Exploration Target",
    landerName: "Artemis III / Commercial Cargo",
    landingSiteName: "Shackleton Crater Rim / Connecting Ridge",
    agency: "NASA Artemis Target",
    status: "target",
    latitudeDeg: -89.9,
    longitudeDeg: 0.0,
    elevationMeters: 1240,
    terrainSlopeDeg: 14.2,
    slopeHazard: "Moderate",
    description: "Ultra-deep polar impact crater. Peaks receive 86-92% annual illumination while interior floor is a deep PSR (-3.8 km).",
  },
  {
    id: "malapert-massif",
    name: "Malapert Massif",
    code: "MALAPERT",
    badgeTone: "purple",
    type: "target-region",
    missionName: "Direct-to-Earth Communications Hub",
    landerName: "Surface Relay Station",
    landingSiteName: "Malapert Massif Peak",
    agency: "NASA CLPS Target",
    status: "target",
    latitudeDeg: -84.9,
    longitudeDeg: 12.9,
    elevationMeters: 5020,
    terrainSlopeDeg: 4.8,
    slopeHazard: "Suitable",
    description: "Prominent 5-km high mountain ridge offering near-continuous direct line of sight to Earth and excellent solar visibility.",
  },
  {
    id: "de-gerlache",
    name: "De Gerlache Crater",
    code: "DE-GERLACHE",
    badgeTone: "blue",
    type: "crater",
    missionName: "CLPS Surface Power Demonstration",
    landerName: "Solar Array Platform",
    landingSiteName: "De Gerlache Crater Rim",
    agency: "NASA Artemis / CLPS",
    status: "target",
    latitudeDeg: -88.5,
    longitudeDeg: -87.1,
    elevationMeters: 1800,
    terrainSlopeDeg: 7.4,
    slopeHazard: "Moderate",
    description: "Crater rim characterized by elevated illumination ridges neighboring volatile-rich shadowed hollows.",
  },
  {
    id: "south-pole",
    name: "South Pole (90.0° S)",
    code: "SOUTH-POLE",
    badgeTone: "cyan",
    type: "target-region",
    missionName: "Lunar South Pole Reference",
    landerName: "IAU Geodesic Datum",
    landingSiteName: "True Selenographic South Pole",
    agency: "IAU / NASA",
    status: "target",
    latitudeDeg: -90.0,
    longitudeDeg: 0.0,
    elevationMeters: 200,
    terrainSlopeDeg: 2.5,
    slopeHazard: "Suitable",
    description: "The selenographic South Pole of the Moon. Central focus for NASA Artemis and CLPS permanent resource utilization.",
  },
];

export function getLandingSiteById(id: string): LunarLocation | undefined {
  return LUNAR_LANDING_SITES.find((s) => s.id === id);
}

/**
 * Returns DEM slope categorization based on NASA robotic rover trafficability limits.
 * < 10°: Suitable (safe for landers and wheeled rovers)
 * 10° - 20°: Moderate (requires traction control, slow traversing)
 * > 20°: Hazardous (slip/rollover risk, crater interior walls)
 */
export function classifyTerrainSlope(slopeDeg: number): "Suitable" | "Moderate" | "Hazardous" {
  if (slopeDeg <= 10) return "Suitable";
  if (slopeDeg <= 20) return "Moderate";
  return "Hazardous";
}
