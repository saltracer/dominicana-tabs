
import type { Province } from "@/types"
import { mexicoBoundaries } from "./mexico-boundaries"

export const mexicoProvince: Province = {
  id: "mexico",
  name: "Province of Santiago de México",
  formation_date: "1532",
  region: "Mexico",
  region_expanded: "Mexico (All states and territories)",
  countries: ["Mexico"],
  website: "https://www.dominicos.mx",
  lay_website: "https://www.dominicos.mx/laicos-dominicos/",
  short_description:
    "The Dominican Province of Santiago de México covers the territory of Mexico and is one of the oldest Dominican provinces in the Americas.",
  description:
    "The Dominican Province of Santiago de México was established in 1532 and has played a significant role in the evangelization and cultural development of Mexico. The province is dedicated to Santiago (St. James) and has a rich history of missionary work, education, and social justice initiatives throughout Mexico.",
  description_array: [
    "The Dominican Province of Santiago de México was established in 1532, making it one of the oldest Dominican provinces in the Americas.",
    "It has played a significant role in the evangelization and cultural development of Mexico, with friars contributing to education, art, architecture, and the defense of indigenous rights.",
    "The province is dedicated to Santiago (St. James) and covers the territory of Mexico.",
    "Throughout its history, the province has established numerous priories, churches, and educational institutions across Mexico.",
    "Today, the friars continue their mission through preaching, teaching, parish ministry, and social justice work throughout the country.",
  ],
  priories: [
    {
      name: "Convento de Santo Domingo",
      location: "Mexico City",
      founded: 1534,
      description: "The first Dominican priory in Mexico City and the historic center of Dominican activity in Mexico.",
    },
    {
      name: "Convento de Santo Domingo",
      location: "Puebla",
      founded: 1538,
      description: "A historic priory known for its beautiful baroque architecture and Rosary Chapel.",
    },
    {
      name: "Convento de Santo Domingo",
      location: "Oaxaca",
      founded: 1551,
      description: "One of the most impressive Dominican complexes in Mexico, known for its ornate decoration.",
    },
  ],
  notable_dominicans: [
    {
      name: "Fray Bartolomé de las Casas",
      dates: "1484-1566",
      description:
        "Known as the 'Protector of the Indians', he was a Spanish Dominican friar who was the first resident Bishop of Chiapas and the first officially appointed 'Protector of the Indians'.",
    },
    {
      name: "Fray Antonio de Montesinos",
      dates: "1475-1540",
      description:
        "Dominican friar who was the first to publicly denounce the mistreatment of indigenous peoples in the Americas.",
    },
  ],
  coordinates: [19.4326, -99.1332], // Mexico City, Mexico
  boundaries: mexicoBoundaries,
  color: "#006847", // Green from the Mexican flag
  province_saint: "St. James the Apostle",
  province_saint_feast_day: "July 25",
}
