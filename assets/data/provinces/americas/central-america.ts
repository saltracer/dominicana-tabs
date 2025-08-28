import type { Province } from "@/types"
import { centralAmericaBoundaries } from "./central-america-boundaries"

export const centralAmericaProvince: Province = {
  id: "central-america",
  name: "Province of Saint Vincent Ferrer",
  formation_date: "1935",
  region: "Central America",
  region_expanded: "Central America (Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica, Panama)",
  countries: ["Guatemala", "El Salvador", "Honduras", "Nicaragua", "Costa Rica", "Panama"],
  website: "https://www.dominicosca.org/",
  lay_website: "https://www.dominicosca.org/laicos/",
  short_description: "Serving six countries in Central America with a focus on social justice and human rights.",
  description:
    "The Province of Central America was established in 1935 and covers Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica, and Panama. It is known for its work in social justice and human rights.",
  description_array: [
    "The Province of Central America was established in 1935, unifying Dominican presence across six countries: Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica, and Panama. Though formally established in the 20th century, Dominicans have been present in the region since the early Spanish colonial period.",
    "The province has been profoundly shaped by the social and political conflicts that have affected Central America, particularly during the civil wars and political violence of the 1970s and 1980s. Dominicans have often stood with marginalized communities during these difficult periods, sometimes at great personal risk.",
    "Social justice and human rights advocacy are central to the province's identity. Friars have been involved in land reform movements, indigenous rights advocacy, and efforts to address the root causes of poverty and inequality that affect many communities throughout Central America.",
    "Education remains an important ministry, with Dominicans operating schools and educational centers that serve students from diverse socioeconomic backgrounds. These institutions aim to form critical thinkers who can contribute to the development of more just societies in the region.",
    "The province has a strong commitment to inculturation, working to express Dominican spirituality in ways that resonate with the diverse cultural traditions of Central America, including indigenous Maya, Garifuna, and mestizo communities.",
    "In recent years, the province has been actively engaged in addressing issues related to migration, as many Central Americans flee violence and economic hardship. Dominicans operate shelters for migrants and advocate for more humane immigration policies throughout the region.",
  ],
  coordinates: [14.6349, -90.5069], // Guatemala City coordinates
  boundaries: centralAmericaBoundaries, // Using imported boundaries
  color: "#0F47AF", // Blue representing the Central American sky
}
