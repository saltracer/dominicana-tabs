import type { Province } from "@/types"
import { congoProvinceBoundaries } from "./dr-congo-boundaries"

export const congoProvince: Province = {
  id: "democratic-republic-congo",
  name: "Vice-Province of St. Pius V",
  formation_date: "1968",
  region: "Central Africa",
  region_expanded: "Central Africa (Democratic Republic of Congo)",
  countries: ["Democratic Republic of Congo"],
  website: "https://www.dominicans.co.za",
  description_array: [
    "The Dominican Province of South Africa was established in 1968, evolving from the English Province's mission.",
    "It covers the Democractic Republic of Congo.",
    "The Provincial House is located in Kinshasa, DRC.",
    "The friars are involved in parish ministry, education, and social justice work, with a particular focus on addressing the legacy of apartheid.",
  ],
  short_description: "Dominican Province covering the DRC",
  description: "Dominican Province covering the DRC",
  coordinates: [-4.3219, 15.3119], // Kinshasa, DRC
  boundaries: congoProvinceBoundaries, // Using imported boundaries
  color: "#007FFF", // Updated: Cobalt blue representing the Congo River
}
