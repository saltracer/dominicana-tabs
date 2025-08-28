import type { Province } from "@/types"
import { taiwanProvinceBoundaries } from "./taiwan-boundaries"

export const taiwanProvince: Province = {
  id: "taiwan",
  name: "Vice-Province of Taiwan",
  formation_date: "1975",
  region: "Taiwan",
  region_expanded: "Taiwan",
  countries: ["Taiwan"],
  website: "https://www.dominicantaiwan.net",
  description_array: [
    "The Dominican Province of Taiwan was established in 1975.",
    "It evolved from the Province of the Holy Rosary's mission, which had been present in Taiwan since the 17th century.",
    "The Provincial House is in Ho Chi Minh City.",
    "Despite periods of religious persecution, the Dominican presence has remained strong in Taiwan.",
    "The friars are engaged in education, parish ministry, and social services throughout the country.",
  ],
  short_description: "Dominican Province covering Taiwan",
  description: "Dominican Province covering Taiwan",
  coordinates: [25.033, 121.5654], // Taipai, Taiwan 25.0330° N, 121.5654° E
  boundaries: taiwanProvinceBoundaries, // Using imported boundaries
  color: "#CE1126", // Updated: Red from Taiwanese flag
}
