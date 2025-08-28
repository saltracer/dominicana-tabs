import type { Province } from "@/types"
import { ecuadorBoundaries } from "./ecuador-boundaries"

export const ecuadorProvince: Province = {
  id: "ecuador",
  name: "Province of Santa Catalina Virgen y Mártir of Ecuador",
  formation_date: 1541,
  region: "Ecuador",
  region_expanded: "Ecuador",
  countries: ["Ecuador"],
  website: "https://www.dominicos.ec",
  lay_website: "https://laicos.dominicos.ec",
  color: "#FFD100", // Yellow from the Ecuadorian flag
  province_saint: "St. Catherine of Alexandria",
  province_saint_feast_day: "November 25",
  short_description:
    "The Dominican Province of Santa Catalina Virgen y Mártir serves the people of Ecuador through education, parish ministry, and cultural preservation.",
  description:
    "The Dominican Province of Santa Catalina Virgen y Mártir was established in Ecuador in 1541. The province has a rich history of evangelization, education, and defense of indigenous rights. The Dominicans were among the first religious orders to arrive in what is now Ecuador, and they played a significant role in the development of Quito and other major cities. Today, the province continues its mission through universities, schools, parishes, and cultural centers throughout Ecuador.",
  description_array: [
    "The Dominican Province of Santa Catalina Virgen y Mártir was established in Ecuador in 1541.",
    "The province has a rich history of evangelization, education, and defense of indigenous rights.",
    "The Dominicans were among the first religious orders to arrive in what is now Ecuador, and they played a significant role in the development of Quito and other major cities.",
    "The province is known for its preservation of colonial art and architecture, particularly in the historic center of Quito.",
    "Today, the province continues its mission through universities, schools, parishes, and cultural centers throughout Ecuador.",
  ],
  coordinates: [-0.1807, -78.467],
  boundaries: ecuadorBoundaries,
  priories: [
    {
      name: "Convento Máximo de San Pedro Mártir",
      location: "Quito",
      founded: 1541,
      description:
        "The historic motherhouse of the Dominican Order in Ecuador, located in the historic center of Quito, a UNESCO World Heritage site.",
    },
    {
      name: "Convento de Santo Domingo",
      location: "Guayaquil",
      founded: 1548,
      description: "Important center for Dominican ministry in Ecuador's largest city and main port.",
    },
    {
      name: "Convento de Nuestra Señora del Rosario",
      location: "Cuenca",
      founded: 1557,
      description:
        "Historic convent in Ecuador's third-largest city, known for its cultural and educational contributions.",
    },
  ],
  notable_dominicans: [
    {
      name: "Fr. Pedro de la Peña",
      dates: "1506-1583",
      description:
        "Second Bishop of Quito who established the first seminary in Ecuador and defended indigenous rights.",
    },
    {
      name: "Fr. Bartolomé García Serrano",
      dates: "1560-1631",
      description:
        "Missionary and linguist who created dictionaries and grammars of indigenous languages to facilitate evangelization.",
    },
    {
      name: "Fr. Enrique Vacas Galindo",
      dates: "1865-1938",
      description:
        "Historian, geographer, and diplomat who defended Ecuador's territorial rights and documented the country's history.",
    },
  ],
  apostolates: [
    "Higher education through the Pontifical Catholic University of Ecuador",
    "Parish ministry in urban and rural areas",
    "Cultural preservation and promotion of religious art",
    "Social justice work with indigenous communities",
    "Evangelization and catechesis",
  ],
}
