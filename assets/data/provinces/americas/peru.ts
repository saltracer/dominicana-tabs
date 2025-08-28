import type { Province } from "@/types"
import { peruBoundaries } from "./peru-boundaries"

export const peruProvince: Province = {
  id: "peru",
  name: "Province of San Juan Bautista del Perú",
  formation_date: 1536,
  region: "Peru",
  region_expanded: "Peru",
  countries: ["Peru"],
  website: "https://www.dominicos.pe",
  lay_website: "https://laicosdominicosdelperu.org",
  color: "#D91023", // Red from the Peruvian flag
  province_saint: "St. John the Baptist",
  province_saint_feast_day: "June 24",
  short_description:
    "The Dominican Province of San Juan Bautista del Perú, established in 1536, serves the people of Peru through education, parish ministry, and social justice work.",
  description:
    "The Dominican Province of San Juan Bautista del Perú was established in 1536, making it one of the oldest Dominican provinces in the Americas. The province played a crucial role in the evangelization of Peru and the defense of indigenous rights, following the example of Fray Bartolomé de las Casas. Today, the province continues its mission through education, parish ministry, and social justice initiatives throughout Peru.",
  description_array: [
    "The Dominican Province of San Juan Bautista del Perú was established in 1536, making it one of the oldest Dominican provinces in the Americas.",
    "The province played a crucial role in the evangelization of Peru and the defense of indigenous rights, following the example of Fray Bartolomé de las Casas.",
    "St. Rose of Lima, the first canonized saint of the Americas, was a Dominican tertiary associated with this province.",
    "The province operates several educational institutions, including the Pontifical University of Saint Thomas Aquinas in Lima.",
    "Today, the province continues its mission through education, parish ministry, and social justice initiatives throughout Peru.",
  ],
  coordinates: [-12.0464, -77.0428],
  boundaries: peruBoundaries,
  priories: [
    {
      name: "Convento de Santo Domingo (Basilica and Convent of Santo Domingo)",
      location: "Lima",
      founded: 1535,
      description:
        "The historic motherhouse of the Dominican Order in Peru, containing the remains of St. Rose of Lima and St. Martin de Porres.",
    },
    {
      name: "Convento de San Pedro Mártir",
      location: "Cusco",
      founded: 1538,
      description: "Historic convent in the former Inca capital, a center for evangelization in the Andean region.",
    },
    {
      name: "Convento de Nuestra Señora del Rosario",
      location: "Arequipa",
      founded: 1579,
      description: "Important center for Dominican education and formation in southern Peru.",
    },
  ],
  notable_dominicans: [
    {
      name: "St. Martin de Porres",
      dates: "1579-1639",
      description:
        "Born in Lima, he was known for his work with the poor and sick, and for his extraordinary humility. He is the patron saint of mixed-race people and those seeking racial harmony.",
    },
    {
      name: "St. Rose of Lima",
      dates: "1586-1617",
      description:
        "The first canonized saint of the Americas, she was a Dominican tertiary known for her life of severe asceticism and care for the poor.",
    },
    {
      name: "Fr. Vicente Bernedo",
      dates: "1562-1619",
      description:
        "Known as the 'Apostle of Charcas,' he was renowned for his missionary work in southern Peru and Bolivia.",
    },
  ],
  apostolates: [
    "Education at all levels, including the Pontifical University of Saint Thomas Aquinas in Lima",
    "Parish ministry in urban and rural areas",
    "Social justice work, particularly with indigenous communities",
    "Promotion of the Rosary and Marian devotion",
    "Missionary work in the Amazon region",
  ],
}
