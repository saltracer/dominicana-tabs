import type { Province } from "@/types"
import { stAlbertBoundaries } from "./st-albert-boundaries"

export const stAlbertProvince: Province = {
  id: "st-albert",
  name: "Province of St Albert the Great",
  formation_date: "1939",
  region: "Central United States",
  region_expanded:
    "Central United States (Colorado, Illinois, Indiana, Iowa, Kansas, Michigan, Minnesota, Missouri, Nebraska, New Mexico, North Dakota, South Dakota, Wyoming)",
  countries: ["United States"],
  website: "https://www.opcentral.org/",
  lay_website: "https://www.opcentral.org/lay-dominicans/",
  short_description: "Serving the central United States since 1939.",
  description:
    "The Province of St. Albert the Great covers the central United States and was established in 1939. It is known for its educational institutions, parishes, and campus ministries throughout the Midwest and Mountain states.",
  description_array: [
    "The Province of St. Albert the Great was established in 1939 as part of the expansion of the Dominican Order in the United States. The province was formed to better serve the growing Catholic population in the central United States.",
    "Named after St. Albert the Great, the 13th-century Dominican friar who was a renowned scientist, philosopher, and teacher of St. Thomas Aquinas, the province embodies his commitment to the pursuit of truth through study and teaching.",
    "Education has been central to the province's mission. The Dominicans of St. Albert province have been involved in campus ministry at major universities throughout the Midwest, including the University of Illinois, University of Minnesota, and University of Colorado.",
    "The province maintains a strong parish presence throughout the central states, with friars serving in urban, suburban, and rural communities. These parishes often serve as centers for Dominican spirituality and preaching.",
    "Social justice initiatives are an important part of the province's work, with friars engaged in advocacy for immigrants, the poor, and marginalized communities throughout the region.",
    "Today, the province continues to adapt to the changing needs of the Church and society, with innovative ministries in digital evangelization, retreat work, and collaborative efforts with Dominican sisters and laity.",
  ],
  coordinates: [41.8781, -87.6298], // Single point coordinates (Chicago)
  boundaries: stAlbertBoundaries, // Using imported boundaries
  color: "#B22234", // Red from the US flag
}
