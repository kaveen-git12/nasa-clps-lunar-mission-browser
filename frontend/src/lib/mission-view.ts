import lander from "@/assets/lander.jpg";
import rover from "@/assets/rover.jpg";
import type { Mission, MissionStatus } from "./mission-store";

/** Uploaded picture first, otherwise the generated artwork for the mission kind. */
export function missionImg(m: Mission): string {
  return m.image ?? (m.img === "rover" ? rover : lander);
}

export const statusTone: Record<MissionStatus, string> = {
  upcoming: "bg-violet",
  active: "bg-success",
  completed: "bg-steel",
};

export const statusLabel: Record<MissionStatus, string> = {
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
};
