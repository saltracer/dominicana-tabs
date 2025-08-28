import type { Province } from "@/types"
import { franceProvinceBoundaries } from "./france-boundaries"

export const franceProvince: Province = {
  id: "france",
  name: "Province of France",
  formation_date: "1303",
  region: "France",
  countries: ["France"],
  website: "https://www.dominicains.fr",
  description_array: [
    "The Dominican Province of France is one of the oldest provinces, dating back to 1303.",
    "It was re-established after the French Revolution and has undergone several reorganizations.",
    "The Provincial House is in Paris.",
    "The friars are engaged in education, parish ministry, and intellectual apostolates.",
    "The province has a strong tradition of theological scholarship and publishing.",
    "The province serves, possibly, Iraq, Egpyt, Norway, Switzerland, Finland, Sweeden",
  ],
  short_description: "Dominican Province covering France and Benelux countries",
  description: "Dominican Province covering France and Benelux countries",
  coordinates: [48.8566, 2.3522], // Paris, France
  boundaries: franceProvinceBoundaries, // Using imported boundaries
  color: "#8FA4B7", //Soft steel-blue for normandy's costal skies
}
