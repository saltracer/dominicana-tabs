import type { Province } from "@/types"
import { italySouthProvinceBoundaries } from "./italy-south-boundaries"

export const italySouthProvince: Province = {
  id: "italy-south",
  name: "Province of St Thomas Aquinas in Italy",
  formation_date: "1302",
  region: "Europe",
  countries: ["Italy", "Malta"],
  website: "https://www.domenicani.net/",
  description_array: [
    "The Dominican Province of St. Dominic in Italy is one of the oldest provinces, dating back to 1302.",
    "It was reorganized in 2016 through the merger of several Italian provinces.",
    "The Provincial House is in Bologna, where St. Dominic is buried.",
    "The friars are engaged in education, parish ministry, and cultural activities.",
    "The province has a strong tradition of art and cultural heritage preservation.",
  ],
  short_description: "Dominican Province covering Southern Italy",
  description: "Dominican Province covering Southern Italy",
  coordinates: [40.8518, 14.2681], // Naples, Italy
  boundaries: italySouthProvinceBoundaries, // Using imported boundaries
  color: "#F0B95E", //A bright golden ochre reflecting sun, citrus, and Mediterranean coastlines.
}
