import type { Province } from "@/types"
import { czechRepublicBoundaries } from "./czech-republic-boundaries"

export const czechRepublicProvince: Province = {
  id: "czech-republic",
  name: "Czech Republic",
  latinName: "Provincia Bohemiae",
  patronSaint: "St. Hyacinth",
  formation_date: 1301,
  website: "https://www.op.cz",
  boundaries: czechRepublicBoundaries,
  coordinates: [50.0755, 14.4378], // Prague
  region: "europe",
  region_expanded: "Europe",
  countries: ["Czech Republic"],
  color: "#D7141A", // Red from Czech flag
  short_description:
    "The Dominican Province of the Czech Republic (Bohemia) dates back to 1301 and has been a center of Dominican life in Central Europe.",
  description:
    "The Dominican Province of the Czech Republic (Bohemia) has a rich history dating back to the early 14th century. The province has experienced periods of growth and decline throughout its history, particularly during the Communist era, but has seen a revival since the fall of Communism in 1989.",
  description_array: [
    "The Dominican Province of the Czech Republic, historically known as the Province of Bohemia, was established in 1301. The first Dominicans arrived in Bohemia as early as 1226, just a few years after the Order's foundation.",
    "During the Hussite Wars in the 15th century, many Dominican convents were destroyed, but the province recovered in the Counter-Reformation period. The province flourished in the 17th and 18th centuries, with numerous priories established throughout Bohemia and Moravia.",
    "The province faced severe challenges during the Communist regime (1948-1989), when religious orders were suppressed and many friars were imprisoned or forced to work in secular jobs. Despite these difficulties, the Dominican presence persisted underground.",
    "Since the Velvet Revolution in 1989, the province has experienced a revival. Today, the Czech Dominicans are active in university ministry, publishing, and parish work, continuing their long tradition of intellectual and pastoral service.",
  ],
  priories: [
    {
      name: "Convent of St. Giles",
      location: "Prague",
      coordinates: [50.0875, 14.4189],
      founded: 1348,
      isProvincialHouse: true,
    },
    {
      name: "Convent of St. Thomas",
      location: "Brno",
      coordinates: [49.1951, 16.6068],
      founded: 1350,
    },
    {
      name: "Convent of the Holy Cross",
      location: "Olomouc",
      coordinates: [49.5938, 17.2509],
      founded: 1468,
    },
  ],
}
