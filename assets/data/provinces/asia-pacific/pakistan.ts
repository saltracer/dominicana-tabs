import type { Province } from "@/types"
import { pakistanProvinceBoundaries } from "./pakistan-boundaries"

export const pakistanProvince: Province = {
  id: "pakistan",
  name: "Vice-Province of Pakistan",
  formation_date: "1982",
  region: "Pakistan",
  region_expanded: "Pakistan (All states and provinces)",
  countries: ["Pakistan"],
  website: "https://www.dominicans-pakistan.org",
  description_array: [
    "The Dominican Vice-Province of Pakistan was established in 1982.",
    "It evolved from the Province of England's mission, which had been present in Pakistan since 1956.",
    "The Vice-Provincial House is in Karachi.",
    "The friars are engaged in education, parish ministry, and interfaith dialogue in Pakistan's predominantly Muslim context.",
    "They operate several educational institutions and are involved in promoting religious harmony.",
  ],
  short_description: "Dominican Vice-Province covering Pakistan",
  description: "Dominican Vice-Province covering Pakistan",
  coordinates: [24.8607, 67.0011], // Karachi, Pakistan
  boundaries: pakistanProvinceBoundaries, // Using imported boundaries
  color: "#01411C", // Updated: Dark green from Pakistani flag
}
