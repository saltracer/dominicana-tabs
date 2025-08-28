import type { Province } from "@/types"
import { englandProvinceBoundaries } from "./england-boundaries"

export const englandProvince: Province = {
  id: "england",
  name: "Province of England",
  formation_date: "1221",
  region: "Europe",
  countries: ["England, Wales, Scotland, Grenada, Jamaica, Barbados"],
  website: "https://www.english.op.org",
  description_array: [
    "The Dominican Province of England was established in 1221 during the lifetime of St. Dominic.",
    "It was suppressed during the English Reformation and re-established in 1622.",
    "The Provincial House is in London.",
    "The friars are engaged in education, parish ministry, and intellectual apostolates.",
    "The province has a strong tradition of theological scholarship and publishing.",
    "The province also has a presence in the nations of Grenada and Jamaica.",
  ],
  short_description: "Dominican Province covering England, Wales, and Scotland",
  description: "Dominican Province covering the England, Wales, and Scotland, with outreach in the Carribean",
  coordinates: [51.5074, -0.1278], // London, UK
  boundaries: englandProvinceBoundaries, // Using imported boundaries
  color: "#3C4C55", //Reminiscent of overcast skies and hisotirc architecture
}
