import type { Province } from "@/types"
import { canadaBoundaries } from "./canada-boundaries"

export const canadaProvince: Province = {
  id: "canada",
  name: "Province of Canada",
  formation_date: "1911",
  region: "Canada",
  region_expanded: "Canada (All provinces and territories)",
  countries: ["Canada"],
  website: "https://www.dominicains.ca/",
  lay_website: "https://www.dominicains.ca/laics-dominicains/",
  short_description: "A bilingual province serving both English and French-speaking communities across Canada.",
  description:
    "The Province of Canada was established in 1911 and covers all of Canada. It is known for its bilingual character, serving both English and French-speaking communities, and for its intellectual tradition.",
  description_array: [
    "The Dominican Province of Canada was established in 1911, though Dominicans had been present in the country since the 17th century when they accompanied early French explorers and settlers. The province encompasses the entirety of Canada, serving both French and English-speaking communities.",
    "The bilingual character of the province is one of its distinctive features, reflecting Canada's dual linguistic heritage. The friars minister in both official languages and have played an important role in fostering dialogue between the country's French and English Catholic traditions.",
    "Intellectual life has been central to the Canadian province's identity. The Dominicans founded the Faculty of Philosophy at the University of Ottawa and established the Institut d'études médiévales at the University of Montreal, which became renowned centers for Thomistic studies in North America.",
    "The province has made significant contributions to Catholic social teaching, with friars actively engaged in labor issues, economic justice, and environmental concerns. This commitment to social justice is expressed through both academic work and direct involvement in community organizing and advocacy.",
    "Ecumenical and interreligious dialogue has been another area of focus for the Canadian Dominicans. The friars have been pioneers in building relationships with Protestant, Orthodox, Jewish, and Muslim communities, particularly in diverse urban centers like Montreal, Toronto, and Vancouver.",
    "In recent decades, the province has adapted to Canada's increasingly multicultural society, developing ministries that serve immigrant communities from Latin America, Asia, and Africa. This has brought new vitality and perspectives to the province while presenting challenges of inculturation and adaptation.",
  ],
  coordinates: [45.5017, -73.5673], // Montreal coordinates
  boundaries: canadaBoundaries,
  color: "#4B796E", // deep pine green, inspired by Canadian forests, national parks, and rugged mountain landscapes
}
