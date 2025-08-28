import type { Province } from "@/types"
import { vietnamProvinceBoundaries } from "./vietnam-boundaries"

export const vietnamProvince: Province = {
  id: "vietnam",
  name: "Province of Our Queen of Martyrs in Vietnam",
  formation_date: "1975",
  region: "Vietnam",
  region_expanded: "Vietnam",
  countries: ["Vietnam"],
  website: "https://daminhvn.net",
  description_array: [
    "The Dominican Province of Vietnam was established in 1975.",
    "It evolved from the Province of the Holy Rosary's mission, which had been present in Vietnam since the 17th century.",
    "The Provincial House is in Ho Chi Minh City.",
    "Despite periods of religious persecution, the Dominican presence has remained strong in Vietnam.",
    "The friars are engaged in education, parish ministry, and social services throughout the country.",
  ],
  short_description: "Dominican Province covering Vietnam",
  description: "Dominican Province covering Vietnam",
  coordinates: [10.8231, 106.6297], // Ho Chi Minh City, Vietnam
  boundaries: vietnamProvinceBoundaries, // Using imported boundaries
  color: "#DA251D", // Updated: Red from Vietnamese flag
}
