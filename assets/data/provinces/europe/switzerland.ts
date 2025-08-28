import type { Province } from "@/types"
import { switzerlandBoundaries } from "./switzerland-boundaries"

export const switzerlandProvince: Province = {
  id: "switzerland",
  name: "Switzerland",
  latinName: "Provincia Helvetiae",
  patronSaint: "St. Nicholas of Flüe",
  formation_date: 1628,
  website: "https://www.dominikaner.ch",
  boundaries: switzerlandBoundaries,
  coordinates: [46.8065, 7.162], // Fribourg, Switzerland
  region: "europe",
  region_expanded: "Europe",
  countries: ["Switzerland"],
  color: "#FF0000", // Red from Swiss flag
  short_description:
    "The Swiss Dominican Province, established in 1628, is known for its intellectual tradition and the prestigious University of Fribourg.",
  description:
    "The Swiss Dominican Province has a history dating back to the 17th century. The province has been known for its commitment to education and intellectual life, as well as its pastoral work in both urban and rural areas.",
  description_array: [
    "The Swiss Dominican Province was established in 1628, though Dominicans had been present in Switzerland since the 13th century. The province has historically maintained close ties with the German and French provinces due to Switzerland's multilingual character.",
    "During the Reformation, many Dominican convents in Switzerland were closed, but the Order maintained a presence in Catholic cantons. The 19th century saw a revival with the establishment of the University of Fribourg in 1889, where Dominicans have played a significant role in the Faculty of Theology.",
    "The province has been known for its intellectual tradition, producing notable theologians and philosophers who have contributed to Catholic thought. The Swiss Dominicans have also been active in ecumenical dialogue, reflecting Switzerland's diverse religious landscape.",
    "Today, despite its small size, the Swiss Dominican Province continues its commitment to education, preaching, and pastoral care. The province maintains a special focus on academic work and formation of young Dominicans from around the world who study at Fribourg.",
  ],
  priories: [
    {
      name: "Albertinum",
      location: "Fribourg",
      coordinates: [46.8064, 7.1621],
      founded: 1890,
      isProvincialHouse: true,
    },
    {
      name: "Convent of St. Hyacinth",
      location: "Zürich",
      coordinates: [47.3769, 8.5417],
      founded: 1935,
    },
    {
      name: "Convent of St. Albert",
      location: "Geneva",
      coordinates: [46.2044, 6.1432],
      founded: 1941,
    },
  ],
}
