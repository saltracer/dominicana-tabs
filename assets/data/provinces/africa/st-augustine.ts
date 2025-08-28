import type { Province } from "@/types"
import { stAugustineProvinceBoundaries } from "./st-augustine-boundaries"

export const stAugustineProvince: Province = {
  id: "st-augustine",
  name: "Province of St. Augustine in West Africa",
  formation_date: "2017",
  region: "West Africa",
  region_expanded: "West Africa (Senegal, Ivory Coast, Benin and Burkina Faso)",
  countries: ["Senegal", "Ivory Coast", "Benin", "Burkina Faso"],
  website: "https://www.opwestafrica.org",
  short_description: "Dominican Province serving Senegal, Ivory Coast, Benin, and Burkina Faso.",
  description:
    "The Province of St. Augustine in West Africa is a vibrant and growing Dominican presence in the region. Established as a mission territory in 1951, it became a Vice-Province in 1973 and was elevated to a full Province in 2017. The friars are engaged in diverse ministries, including parish work, education, and social justice initiatives, striving to embody the Dominican charism in the context of West African cultures and challenges.",
  description_array: [
    "The Dominican presence in West Africa began in the mid-20th century, with friars arriving to establish missions and schools in various countries. Over time, these efforts coalesced into a distinct Dominican entity, initially under the guidance of other established provinces.",
    "The Province of St. Augustine officially came into being in 2017, marking a significant step in the development of the Dominican Order in West Africa. This elevation recognized the maturity and vitality of the Dominican presence in the region, as well as its capacity for self-governance and continued growth.",
    "The Province serves the countries of Senegal, Ivory Coast, Benin, and Burkina Faso, each with its unique cultural, religious, and socioeconomic landscape. This diversity presents both opportunities and challenges for the friars as they seek to preach the Gospel and serve the needs of the local population.",
    "Dominican friars in the Province are engaged in a variety of ministries, including parish work, where they provide pastoral care and administer the sacraments; education, where they teach in schools and universities; and social justice initiatives, where they advocate for the poor and marginalized.",
    "The Province is committed to inculturation, seeking to express Dominican spirituality in ways that are meaningful and relevant to the West African context. This involves studying local cultures, engaging in interreligious dialogue, and promoting sustainable development.",
  ],
  coordinates: [5.3252, -4.0196], // Abidjan, Cote d'Ivoire
  boundaries: stAugustineProvinceBoundaries, // Using imported boundaries
  province_saint: "St. Augustine of Hippo",
  province_saint_feast_day: "August 28",
  color: "#E5BE01", // Updated: Warm yellow representing the Sahel region
}
