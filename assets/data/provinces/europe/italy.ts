import type { Province } from "@/types"
import { italyProvinceBoundaries } from "./italy-boundaries"

export const italyProvince: Province = {
  id: "italy",
  name: "Province of St. Dominic in Italy",
  formation_date: "1302",
  region: "Europe",
  countries: ["Italy", "Malta"],
  website: "https://www.domenicani.it",
  description_array: [
    "The Dominican Province of St. Dominic in Italy is one of the oldest provinces, dating back to 1302.",
    "It was reorganized in 2016 through the merger of several Italian provinces.",
    "The Provincial House is in Bologna, where St. Dominic is buried.",
    "The friars are engaged in education, parish ministry, and cultural activities.",
    "The province has a strong tradition of art and cultural heritage preservation.",
  ],
  short_description: "Dominican Province covering Italy and Malta",
  description: "Dominican Province covering Italy and Malta",
  coordinates: [44.4949, 11.3426], // Bologna, Italy
  boundaries: italyProvinceBoundaries, // Using imported boundaries
  color: "#009988",
}

