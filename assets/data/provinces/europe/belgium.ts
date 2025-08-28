import type { Province } from "@/types"
import { belgiumBoundaries } from "./belgium-boundaries"

export const belgiumProvince: Province = {
  id: "belgium",
  name: "Belgium",
  latinName: "Provincia Belgica",
  patronSaint: "St. Dominic",
  formation_date: 1459,
  website: "https://www.dominicains.be",
  boundaries: belgiumBoundaries,
  coordinates: [51.0593, 3.751], // Sint-Amandsberg (also includes the province of the netherlands, as a provincal vicarate
  region: "europe",
  region_expanded: "Europe",
  countries: ["Belgium", "Luxembourg"],
  color: "#FDDA24", // Yellow from Belgian flag
  short_description:
    "The Belgian Dominican Province, dating back to 1459, is known for its intellectual tradition and social engagement in both French and Flemish communities.",
  description:
    "The Belgian Dominican Province has a history dating back to the 15th century. The province has been known for its intellectual tradition and commitment to social justice, producing many notable theologians and social activists.",
  description_array: [
    "The Belgian Dominican Province was established in 1459, though Dominicans had been present in the region since the 13th century. The province originally covered the entire Low Countries but was later divided with the formation of the Dutch Province.",
    "The province has historically reflected Belgium's linguistic diversity, with convents in both French-speaking Wallonia and Dutch-speaking Flanders. This bilingual character has allowed the Belgian Dominicans to serve as a bridge between different European cultural traditions.",
    "In the 19th and 20th centuries, Belgian Dominicans became known for their social engagement and intellectual contributions. The province produced influential figures in theology, philosophy, and social teaching, and was active in the missionary fields of the Belgian Congo.",
    "Today, the Belgian Dominican Province continues its tradition of intellectual apostolate and social commitment. The province maintains a focus on education, preaching, and dialogue with contemporary culture, while adapting to the increasingly secular nature of Belgian society.",
  ],
  priories: [
    {
      name: "Convent of La Sarte",
      location: "Brussels",
      coordinates: [50.8503, 4.3517],
      founded: 1901,
      isProvincialHouse: true,
    },
    {
      name: "Convent of St. Thomas Aquinas",
      location: "Leuven",
      coordinates: [50.8798, 4.7005],
      founded: 1923,
    },
    {
      name: "Convent of St. Dominic",
      location: "Antwerp",
      coordinates: [51.2194, 4.4025],
      founded: 1571,
    },
  ],
}
