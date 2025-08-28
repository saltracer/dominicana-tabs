import type { Province } from "@/types"
import { philippinesProvinceBoundaries } from "./philippines-boundaries"

export const philippinesProvince: Province = {
  id: "philippines",
  name: "Province of the Philippines",
  formation_date: "1971",
  region: "Philippines",
  region_expanded: "Philippines (All states and provinces)",
  countries: ["Philippines"],
  website: "https://www.opphil.org",
  description_array: [
    "The Dominican Province of the Philippines was established in 1971.",
    "It evolved from the Province of the Holy Rosary's mission, which had been present in the Philippines since 1587.",
    "The Provincial House is in Manila.",
    "The friars are engaged in education, parish ministry, and social justice work throughout the Philippine archipelago.",
    "They operate several educational institutions, including the University of Santo Tomas, the oldest university in Asia.",
  ],
  short_description: "Dominican Province covering the Philippine archipelago",
  description: "Dominican Province covering the Philippine archipelago",
  coordinates: [14.5995, 120.9842], // Manila, Philippines
  boundaries: philippinesProvinceBoundaries, // Using imported boundaries
  color: "#0038A8", // Updated: Blue from Philippine flag
}
