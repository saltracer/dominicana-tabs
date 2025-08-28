import type { Province } from "@/types"
import { spainProvinceBoundaries } from "./spain-boundaries"

export const spainProvince: Province = {
  id: "spain",
  name: "Province of Hispania",
  formation_date: "1301",
  region: "Europe",
  countries: ["Spain"],
  website: "https://www.dominicoshispania.org/",
  description_array: [
    "The Dominican Province of Spain is one of the oldest provinces, dating back to 1301.",
    "It was reorganized in 2016 through the merger of several Spanish provinces.",
    "The Provincial House is in Madrid.",
    "The friars are engaged in education, parish ministry, and missionary work.",
    "The province has a strong tradition of missionary activity in Latin America and Asia. This includes Cuba, Dominican Republic, Equatorial Guinea, Paraguay, and Uraguay",
  ],
  short_description: "Dominican Province covering Spain and Portugal",
  description: "Dominican Province covering Spain and Portugal",
  coordinates: [40.4168, -3.7038], // Madrid, Spain
  boundaries: spainProvinceBoundaries,
  color: "#C3583E", //A vibrant clay-red influenced by Spanish tile roofs, flamenco warmth, and Andalusian earth.
}
