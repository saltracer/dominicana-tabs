import type { Province } from "@/types"
import { argentinaBoundaries } from "./argentina-boundaries"

export const argentinaProvince: Province = {
  id: "argentina",
  name: "Province of San Agustín of Argentina",
  formation_date: 1724,
  region: "Argentina",
  region_expanded: "Argentina",
  countries: ["Argentina"],
  website: "https://www.dominicosargentina.org",
  lay_website: "https://laicos.dominicosargentina.org",
  color: "#74ACDF", // Light blue from the Argentine flag
  province_saint: "St. Augustine",
  province_saint_feast_day: "August 28",
  short_description:
    "The Dominican Province of San Agustín serves the people of Argentina through education, parish ministry, and intellectual apostolate.",
  description:
    "The Dominican Province of San Agustín in Argentina was formally established in 1724, although Dominicans had been present in the region since the early 16th century. The province has a strong tradition of intellectual apostolate and education, operating several universities and schools throughout Argentina. The province also maintains a significant presence in parish ministry, particularly in urban centers like Buenos Aires, Córdoba, and Tucumán. Throughout its history, the province has produced notable theologians, philosophers, and social activists who have contributed to Argentine society and the universal Church.",
  description_array: [
    "The Dominican Province of San Agustín in Argentina was formally established in 1724, although Dominicans had been present in the region since the early 16th century.",
    "The province has a strong tradition of intellectual apostolate and education, operating several universities and schools throughout Argentina.",
    "The province maintains a significant presence in parish ministry, particularly in urban centers like Buenos Aires, Córdoba, and Tucumán.",
    "Throughout its history, the province has produced notable theologians, philosophers, and social activists who have contributed to Argentine society and the universal Church.",
    "The province is known for its commitment to social justice and human rights, particularly during challenging periods of Argentine history.",
  ],
  coordinates: [-34.6037, -58.3816],
  boundaries: argentinaBoundaries,
  priories: [
    {
      name: "Convento de Santo Domingo",
      location: "Buenos Aires",
      founded: 1601,
      description:
        "The historic motherhouse of the Dominican Order in Argentina, located near the Plaza de Mayo in the heart of Buenos Aires.",
    },
    {
      name: "Convento de San Pedro Telmo",
      location: "Buenos Aires",
      founded: 1734,
      description:
        "Historic convent that gave its name to the San Telmo neighborhood, now a center for Dominican intellectual and cultural activities.",
    },
    {
      name: "Convento de Santo Domingo",
      location: "Córdoba",
      founded: 1604,
      description:
        "Important center for Dominican education and formation in central Argentina, associated with the Universidad Nacional de Córdoba.",
    },
  ],
  notable_dominicans: [
    {
      name: "Fr. Antonio de Montesinos",
      dates: "1475-1540",
      description:
        "While primarily associated with Hispaniola, he also worked in the Río de la Plata region and was an early defender of indigenous rights.",
    },
    {
      name: "Fr. Justo Santa María de Oro",
      dates: "1772-1836",
      description:
        "Dominican friar who participated in the Congress of Tucumán that declared Argentina's independence in 1816, later becoming Bishop of Cuyo.",
    },
    {
      name: "Fr. José Ignacio Thames",
      dates: "1762-1832",
      description:
        "Patriot and educator who supported Argentine independence and established educational institutions in Tucumán.",
    },
  ],
  apostolates: [
    "Higher education through universities and theological faculties",
    "Parish ministry in urban and rural areas",
    "Intellectual apostolate through publications and cultural centers",
    "Social justice work and human rights advocacy",
    "Spiritual direction and retreat ministry",
  ],
}
