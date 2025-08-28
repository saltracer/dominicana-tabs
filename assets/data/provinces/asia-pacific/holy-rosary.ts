import type { Province } from "@/types"
import { holyRosaryProvinceBoundaries } from "./holy-rosary-boundaries"

export const holyRosaryProvince: Province = {
  id: "holy-rosary",
  name: "Province of Our Lady of the Rosary",
  formation_date: "1971",
  region: "Asia-Pacific",
  region_expanded: "Asia-Pacific (Philippines, China, Taiwan, etc)",
  countries: ["Philippines, Far East"],
  website: "https://www.holyrosaryprovince.org/",
  description_array: [
    "The Dominican Province of Our Ldary of the Rosary was established in 1971.",
    "It evolved from the Province of the Holy Rosary's mission, which had been present in the Philippines since 1587.",
    "The Provincial House is in Manila.",
    "The friars are engaged in education, parish ministry, and social justice work throughout the Philippine archipelago.",
    "They operate several educational institutions, including the University of Santo Tomas, the oldest university in Asia.",
  ],
  short_description: "Dominican Province covering the nations of the Far East",
  description: "Dominican Province covering the nations of the Far East",
  coordinates: [22.3193, 114.1694], // Hong Kong, China22.3193° N, 114.1694° E
  boundaries: holyRosaryProvinceBoundaries, // Using imported boundaries
  color: "#C8102E", // Updated: Deep red representing the rosary beads
}
