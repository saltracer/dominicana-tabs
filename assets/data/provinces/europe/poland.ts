import type { Province } from "@/types"
import { polandProvinceBoundaries } from "./poland-boundaries"

export const polandProvince: Province = {
  id: "poland",
  name: "Province of Poland",
  formation_date: "1228",
  region: "Europe",
  countries: ["Poland", "Ukraine"],
  website: "https://www.dominikanie.pl",
  lay_website: "https://swieccy.dominikanie.pl/",
  description_array: [
    "The Dominican Province of Poland was established in 1228.",
    "It is one of the oldest provinces and has a rich history in Eastern Europe.",
    "The Provincial House is in Kraków.",
    "The friars are engaged in education, parish ministry, and youth ministry.",
    "The province has experienced significant growth since the fall of communism.",
    "The province has responsibility for the Vicariate of Ukraine, called the General Vicariate of St Michael the Archangel",
  ],
  short_description: "Dominican Province covering Poland and Eastern European countries",
  description: "Dominican Province covering Poland and Ukraine countries",
  coordinates: [50.0647, 19.945], // Kraków, Poland
  boundaries: polandProvinceBoundaries,
  color: "#C1B8AF", //A warm neutral taupe reminiscent of Polish stone architecture and foggy winters.
}
