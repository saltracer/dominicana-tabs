import type { Province } from "@/types"
import { germanyProvinceBoundaries } from "./germany-boundaries"

export const germanyProvince: Province = {
  id: "germany",
  name: "Province of St Albert in Germany and Austria (Teutonia)",
  formation_date: "1221",
  region: "Europe",
  countries: ["Germany", "Austria", "Hungary"],
  website: "https://www.dominikaner.de",
  description_array: [
    "The Dominican Province of St Albert the Great in Germany and Austria was erected in 2024 as a uniting of the provinces of Saint Albert the Great in Upper Germania and of Teutonia with its vicariate in Hungary.",
    "It covers Germany and austria and hungary.",
    "The Provincial House is in Cologne, Germany.",
    "The friars are engaged in education, parish ministry, and intellectual apostolates.",
    "The province has a strong tradition of theological scholarship and publishing.",
  ],
  short_description: "Dominican Province covering Germany and Austria and Hungary",
  description: "Dominican Province covering Germany and Austria and Hungary",
  coordinates: [50.9375, 6.9603], // Cologne, Germany
  boundaries: germanyProvinceBoundaries,
  color: "#4E5358", //A cool charcoal-gray that reflects the urban-industrial tone of central Germany with a nod to Black Forest woodlands
}
