import type { Province } from "@/types"
import { franceToulouseProvinceBoundaries } from "./france-toulouse-boundaries"

export const franceToulouseProvince: Province = {
  id: "france-toulouse",
  name: "Province of Toulouse",
  formation_date: "1221",
  region: "Southern France (Toulouse, Bordeaux, Marseille, Montpellier, Nice, The Holy Baume, The Reunion) and Haiti",
  countries: ["France", "Haiti"],
  website: "https://www.dominicains.com/",
  description_array: [
    "The Dominican Province of France is one of the oldest provinces, dating back to 1303.",
    "It was re-established after the French Revolution and has undergone several reorganizations.",
    "The Provincial House is in Paris.",
    "The friars are engaged in education, parish ministry, and intellectual apostolates.",
    "The province has a strong tradition of theological scholarship and publishing.",
    "Parts of France (Toulouse, Bordeaux, Marseille, Montpellier, Nice, The Holy Baume (Provence), The Reunion (by Madagascar) and Haiti",
  ],
  short_description:
    "Dominican Province covering Parts of France (Toulouse, Bordeaux, Marseille, Montpellier, Nice, The Holy Baume, The Reunion) and Haiti",
  description:
    "Dominican Province covering Parts of France (Toulouse, Bordeaux, Marseille, Montpellier, Nice, The Holy Baume, The Reunion) and Haiti",
  coordinates: [43.6048, 1.4428], // Toulouse, France 43.6048° N, 1.4428° E
  boundaries: franceToulouseProvinceBoundaries, // Using imported boundaries
  color: "#D8A97B", // terracotta-beige inspired by Provençal earth and sun-baked stone walls
}
