import type { Province } from "@/types"
import { italyCentralProvinceBoundaries } from "./italy-central-boundaries"

export const italyCentralProvince: Province = {
  id: "italy-central",
  name: "Roman Province of Saint Catherine of Siena",
  formation_date: "1302",
  region: "Europe",
  countries: ["Italy", "Malta"],
  website: "https://www.dominicanes.it/",
  description_array: [
    "The Dominican Province of St. Dominic in Italy is one of the oldest provinces, dating back to 1302.",
    "They are present in central Italy in the following regions: Lazio, Tuscany, Umbria, Abruzzo, Sardinia.",
    "It was reorganized in 2016 through the merger of several Italian provinces.",
    "The Provincial House is in Bologna, where St. Dominic is buried.",
    "The friars are engaged in education, parish ministry, and cultural activities.",
    "The province has a strong tradition of art and cultural heritage preservation.",
  ],
  short_description: "Dominican Province covering central Italy including Sardinia",
  description: "Dominican Province covering central Italy including Sardinia",
  coordinates: [41.8967, 12.4822], // Rome, Italy
  boundaries: italyCentralProvinceBoundaries, // Using imported boundaries
  color: "#B77D54", //rustic sienna that echoes Tuscan clay roofs and Roman ruins.
}
