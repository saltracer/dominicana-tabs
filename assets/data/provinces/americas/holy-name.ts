import type { Province } from "@/types"
import { holyNameBoundaries } from "./holy-name-boundaries"

export const holyNameProvince: Province = {
  id: "holy-name",
  name: "Province of the Holy Name",
  formation_date: "1850",
  region: "Western United States",
  region_expanded:
    "Western United States (Arizona, California, Idaho, Montana, Nevada, Utah, Oregon, Washington, Alaska, Hawaii)",
  countries: ["United States"],
  website: "https://www.opwest.org/",
  lay_website: "https://www.opwest.org/lay-dominicans/",
  short_description: "Serving the western United States since 1850, with a focus on education and missionary work.",
  description:
    "The Province of the Holy Name covers the western United States and was established in 1850. It is known for its missionary work and educational institutions, including the Dominican School of Philosophy and Theology in Berkeley, California.",
  description_array: [
    "The Province of the Holy Name was established in 1850 to serve the rapidly growing Catholic population in the western United States following the Gold Rush. The province was founded by Joseph Sadoc Alemany, a Spanish Dominican who later became the first Archbishop of San Francisco.",
    "The early friars of the province faced significant challenges as they established the Church in the frontier territories. They traveled extensively throughout California, Oregon, and Washington, often on horseback, to minister to scattered Catholic communities in mining camps, ranches, and emerging towns.",
    "Education has been central to the province's mission from its beginning. In 1851, the Dominicans established the first Catholic school in California. Today, the Dominican School of Philosophy and Theology in Berkeley continues this educational tradition as a member of the Graduate Theological Union.",
    "The province has been characterized by its cultural diversity, reflecting the multicultural nature of the western United States. From its earliest days, the province has included friars from Spanish, Irish, German, and later Mexican, Vietnamese, and Filipino backgrounds, enriching its approach to ministry.",
    "Social justice has been a significant focus for the Province of the Holy Name. The friars have been involved in labor issues, immigration advocacy, and environmental concerns, seeing these as natural extensions of the Dominican commitment to truth and justice.",
    "Today, the province maintains a vibrant presence throughout the western states, with ministries that include parishes, campus ministry at major universities, retreat centers, and innovative forms of preaching through digital media and the arts.",
  ],
  coordinates: [37.7749, -122.4194], // Single point coordinates (San Francisco)
  boundaries: holyNameBoundaries, // Using imported boundaries
  color: "#3C3B6E", // Navy blue from the US flag
}
