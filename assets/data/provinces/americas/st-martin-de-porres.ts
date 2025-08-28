import type { Province } from "@/types"
import { stMartinDePorresBoundaries } from "./st-martin-de-porres-boundaries"

export const stMartinDePorresProvince: Province = {
  id: "st-martin-de-porres",
  name: "Province of St. Martin de Porres",
  formation_date: "1979",
  region: "Southern United States",
  region_expanded:
    "Southern United States (Texas, Oklahoma, Arkansas, Louisiana, Mississippi, Tennessee, Alabama, Florida, Georgia, South Carolina, North Carolina)",
  countries: ["United States"],
  website: "https://www.opsouth.org/",
  lay_website: "https://www.opsouth.org/lay-dominicans/",
  short_description: "The youngest U.S. province, serving diverse communities across the southern states.",
  description:
    "The Province of St. Martin de Porres covers the southern United States and was established in 1979. It is known for its diverse ministries, including campus ministry, parish work, and outreach to Hispanic communities.",
  description_array: [
    "The Province of St. Martin de Porres, established in 1979, is the youngest of the Dominican provinces in the United States. It was formed through the merger of the Southern Province (founded in 1921) and the St. Albert the Great Province, creating a new entity to serve the southern United States.",
    "The province is named after St. Martin de Porres, the 17th-century Peruvian Dominican brother known for his extraordinary charity and care for the poor. This patronage reflects the province's commitment to serving diverse communities and addressing issues of racial and economic justice.",
    "Geographically, the province spans from Texas to Florida and northward to Kentucky, encompassing a region with rapidly growing Catholic populations, particularly among Hispanic communities. The friars have developed significant ministries serving Spanish-speaking Catholics throughout the South.",
    "Campus ministry has been a particular strength of the province, with friars serving at major universities including Tulane, Emory, Texas A&M, and the University of Florida. These ministries focus on engaging young adults in intellectual exploration of the faith in the Dominican tradition.",
    "The province maintains a strong commitment to preaching through various media, including radio, television, and digital platforms. The friars have been pioneers in using new technologies to extend the reach of Dominican preaching beyond traditional parish settings.",
    "Community outreach and social justice initiatives are central to the province's work, with friars actively engaged in addressing issues such as immigration, poverty, and racial reconciliation that are particularly pressing in the southern United States.",
  ],
  coordinates: [29.7604, -95.3698], // Houston coordinates
  boundaries: stMartinDePorresBoundaries,
  color: "#782F40", // Garnet representing the southern states
}
