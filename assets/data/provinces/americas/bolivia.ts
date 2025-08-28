import type { Province } from "@/types"
import { boliviaBoundaries } from "./bolivia-boundaries"

export const boliviaProvince: Province = {
  id: "bolivia",
  name: "Vice-Province of San Vicente Ferrer of Bolivia",
  formation_date: 1953,
  region: "Bolivia",
  region_expanded: "Bolivia",
  countries: ["Bolivia"],
  website: "https://www.dominicosbolivia.org",
  lay_website: "https://laicos.dominicosbolivia.org",
  color: "#F4E400", // Yellow from the Bolivian flag
  province_saint: "St. Vincent Ferrer",
  province_saint_feast_day: "April 5",
  short_description:
    "The Dominican Province of San Vicente Ferrer serves the people of Bolivia through education, parish ministry, and work with indigenous communities.",
  description:
    "The Dominican Province of San Vicente Ferrer was established in Bolivia in 1953, although Dominicans had been present in the region since the colonial period. The province has a strong commitment to serving Bolivia's diverse population, with particular attention to indigenous communities in the Andean highlands and eastern lowlands. The Bolivian Dominicans operate schools, parishes, and social centers throughout the country, with a focus on inculturation and respect for Bolivia's rich cultural heritage. The province is known for its work in promoting indigenous rights, environmental justice, and intercultural dialogue.",
  description_array: [
    "The Dominican Province of San Vicente Ferrer was established in Bolivia in 1953, although Dominicans had been present in the region since the colonial period.",
    "The province has a strong commitment to serving Bolivia's diverse population, with particular attention to indigenous communities in the Andean highlands and eastern lowlands.",
    "The Bolivian Dominicans operate schools, parishes, and social centers throughout the country, with a focus on inculturation and respect for Bolivia's rich cultural heritage.",
    "The province is known for its work in promoting indigenous rights, environmental justice, and intercultural dialogue.",
    "In recent decades, the province has been at the forefront of developing an indigenous theology that integrates Andean spirituality with Catholic tradition.",
  ],
  coordinates: [-16.5, -68.15],
  boundaries: boliviaBoundaries,
  priories: [
    {
      name: "Convento de Santo Domingo",
      location: "La Paz",
      founded: 1590,
      description:
        "The historic motherhouse of the Dominican Order in Bolivia, located in the country's administrative capital.",
    },
    {
      name: "Convento de San Vicente Ferrer",
      location: "Cochabamba",
      founded: 1632,
      description: "Center for Dominican formation and education in central Bolivia.",
    },
    {
      name: "Convento de Santa Rosa",
      location: "Santa Cruz de la Sierra",
      founded: 1965,
      description: "More recent foundation serving Bolivia's fastest-growing city and the eastern lowlands.",
    },
  ],
  notable_dominicans: [
    {
      name: "Fr. José Domingo Ulloa",
      dates: "1854-1936",
      description:
        "Bolivian Dominican who served as a missionary in the Amazon region and advocated for indigenous rights.",
    },
    {
      name: "Fr. Tomás de San Martín",
      dates: "1482-1555",
      description:
        "While primarily associated with Peru, he also worked in what is now Bolivia and was instrumental in establishing the Dominican presence in the region.",
    },
    {
      name: "Fr. Xavier Albó",
      dates: "1934-2023",
      description:
        "Jesuit anthropologist who worked closely with Bolivian Dominicans on indigenous rights and intercultural dialogue.",
    },
  ],
  apostolates: [
    "Education at all levels, with special attention to rural and indigenous communities",
    "Parish ministry in urban and rural areas",
    "Social justice work, particularly with indigenous communities",
    "Promotion of intercultural dialogue and indigenous theology",
    "Environmental justice, especially in the Amazon region",
  ],
}
