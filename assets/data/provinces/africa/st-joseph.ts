import type { Province } from "@/types"
import { stJosephProvinceBoundaries } from "./st-joseph-boundaries"

export const stJosephProvince: Province = {
  id: "st-joseph-the-worker",
  name: "Province of St. Joseph the Worker in West Africa",
  formation_date: "1993",
  region: "West Africa",
  region_expanded: "West Africa (Nigeria, Ghana)",
  countries: ["Nigeria", "Ghana"],
  website: "https://www.dominicanfriarsng.org/",
  description_array: [
    "The Province of St. Augustine in West Africa was established in 1951 as a mission territory.",
    "It became a Vice-Province in 1973 and was elevated to a full Province in 1993.",
    "The Province covers Nigeria, Ghana, and Benin, with its Provincial House in Ibadan, Nigeria.",
    "The friars are engaged in parish ministry, education, and social justice initiatives throughout West Africa.",
  ],
  short_description: "Dominican Province covering Nigeria and Ghana",
  description: "Dominican Province covering Nigeria and Ghana",
  coordinates: [6.5095, 3.3711], // Yaba, Nigeria
  boundaries: stJosephProvinceBoundaries, // Using imported boundaries
  color: "#008751", // Updated: Green from Nigerian flag
}
