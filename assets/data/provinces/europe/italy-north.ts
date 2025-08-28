import type { Province } from "@/types"
import { italyNorthProvinceBoundaries } from "./italy-north-boundaries"

export const italyNorthProvince: Province = {
  id: "italy-north",
  name: "Province of St. Dominic in Italy",
  formation_date: "1302",
  region: "Northern Italy",
  region_expanded: "Northern Italy ",
  countries: ["Italy"],
  website: "https://www.domenicani.it",
  description_array: [
    "The Dominican Province of St. Dominic in Italy is one of the oldest provinces, dating back to 1302.",
    "It was reorganized in 2016 through the merger of several Italian provinces.",
    "The Provincial House is in Bologna, where St. Dominic is buried.",
    "The friars are engaged in education, parish ministry, and cultural activities.",
    "The province has a strong tradition of art and cultural heritage preservation.",
  ],
  short_description: "Dominican Province covering northern Italy",
  description: "Dominican Province covering northern Italy",
  coordinates: [45.4685, 9.1824], // Milan, Italy
  boundaries: italyNorthProvinceBoundaries, // Using imported boundaries
  color: "#6B8D8E", //A muted alpine teal-gray inspired by Lake Como and the Dolomites.
}
