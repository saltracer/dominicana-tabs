import type { Province } from "@/types"
import { indiaProvinceBoundaries } from "./india-boundaries"

export const indiaProvince: Province = {
  id: "india",
  name: "Province of India",
  formation_date: "1962",
  region: "India",
  region_expanded: "India (All states and provinces)",
  countries: ["India"],
  website: "https://www.dominicans.in",
  description_array: [
    "The Dominican Province of India was established in 1962.",
    "It evolved from the Province of the Holy Rosary's mission, which had been present in India since the 16th century.",
    "The Provincial House is in Nagpur.",
    "The friars are engaged in education, parish ministry, and social justice work throughout India.",
    "They have a particular focus on interfaith dialogue in India's diverse religious context.",
  ],
  short_description: "Dominican Province covering India",
  description: "Dominican Province covering India",
  coordinates: [21.1458, 79.0882], // Nagpur, India
  boundaries: indiaProvinceBoundaries, // Using imported boundaries
  color: "#FF9933", // Updated: Saffron color from Indian flag
}
