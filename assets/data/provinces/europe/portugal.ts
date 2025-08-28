import type { Province } from "@/types"
import { portugalBoundaries } from "./portugal-boundaries"

export const portugalProvince: Province = {
  id: "portugal",
  name: "Portugal",
  latinName: "Provincia Lusitaniae",
  patronSaint: "Our Lady of the Rosary",
  formation_date: 1418,
  website: "https://www.dominicanos.pt",
  boundaries: portugalBoundaries,
  coordinates: [38.7223, -9.1393], // Lisbon, Portugal
  region: "Portugal",
  region_expanded: "Portugal",
  countries: ["Portugal"],
  color: "#006600", // Green from Portuguese flag
  short_description:
    "The Portuguese Dominican Province, established in 1418, has a distinguished history of missionary work and intellectual contributions.",
  description:
    "The Portuguese Dominican Province has a rich history dating back to the early 15th century. The province has been influential in Portuguese religious and cultural life, and has produced many notable theologians and missionaries.",
  description_array: [
    "The Portuguese Dominican Province was officially established in 1418, though Dominicans had been present in Portugal since 1217, when friars were sent by St. Dominic himself. The province quickly became a center of learning and missionary activity.",
    "During the Age of Discovery in the 15th and 16th centuries, Portuguese Dominicans played a crucial role in the evangelization efforts in Africa, Asia, and the Americas. They established missions in Brazil, Angola, Mozambique, Goa, Macau, and Timor, spreading both the faith and Portuguese culture.",
    "The province suffered greatly during the anti-clerical policies of the 18th century under the Marquis of Pombal and was suppressed entirely in 1834 during the Liberal Revolution. It was only reestablished in 1962 after more than a century of absence.",
    "Today, the Portuguese Dominican Province continues its tradition of intellectual and pastoral work. The province maintains a special focus on education, social justice, and dialogue with contemporary culture, while honoring its rich missionary heritage.",
  ],
  priories: [
    {
      name: "Convent of São Domingos",
      location: "Lisbon",
      coordinates: [38.7223, -9.1393],
      founded: 1241,
      isProvincialHouse: true,
    },
    {
      name: "Convent of Santa Cruz",
      location: "Porto",
      coordinates: [41.1579, -8.6291],
      founded: 1237,
    },
    {
      name: "Convent of Nossa Senhora da Misericórdia",
      location: "Coimbra",
      coordinates: [40.2033, -8.4103],
      founded: 1227,
    },
  ],
}
