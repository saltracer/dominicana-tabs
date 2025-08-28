import type { Province } from "@/types"
import { slovakiaBoundaries } from "./slovakia-boundaries"

export const slovakiaProvince: Province = {
  id: "slovakia",
  name: "Slovakia",
  latinName: "Provincia Slovaciae",
  patronSaint: "St. Cyril and Methodius",
  formation_date: 1935,
  website: "https://www.dominikani.sk",
  boundaries: slovakiaBoundaries,
  coordinates: [48.1486, 17.1077], // Bratislava, Slovakia
  region: "europe",
  region_expanded: "Europe",
  countries: ["Slovakia"],
  color: "#0E4C92", // Blue from Slovak flag
  short_description:
    "The Slovak Dominican Province, established in 1935, has persevered through Communist persecution and now thrives in the post-Soviet era.",
  description:
    "The Slovak Dominican Province was established in the 20th century, though Dominicans have been present in the region since the 13th century. The province has experienced periods of growth and suppression, particularly during the Communist era, but has seen a revival since 1989.",
  description_array: [
    "The Slovak Dominican Province was officially established in 1935, separating from the former Austro-Hungarian province. However, Dominicans had been present in the region since 1221, when friars were sent by St. Dominic himself to what was then part of the Kingdom of Hungary.",
    "During the Communist regime (1948-1989), the Slovak Dominicans faced severe persecution. Many friars were imprisoned, sent to labor camps, or forced to work in secular jobs. The Order operated underground during this period, with secret ordinations and clandestine formation.",
    "After the Velvet Revolution in 1989, the province experienced a remarkable revival. New vocations emerged, convents were reopened or newly established, and the Dominicans resumed their public ministry. The province has since rebuilt its structures and expanded its apostolate.",
    "Today, the Slovak Dominican Province is active in parish ministry, university chaplaincy, and publishing. The province maintains a strong focus on youth ministry and intellectual formation, continuing the Dominican tradition of preaching adapted to contemporary Slovak society.",
  ],
  priories: [
    {
      name: "Convent of St. Dominic",
      location: "Bratislava",
      coordinates: [48.1486, 17.1077],
      founded: 1935,
      isProvincialHouse: true,
    },
    {
      name: "Convent of the Holy Trinity",
      location: "Košice",
      coordinates: [48.7164, 21.2611],
      founded: 1945,
    },
    {
      name: "Convent of St. Thomas Aquinas",
      location: "Žilina",
      coordinates: [49.2231, 18.7394],
      founded: 1992,
    },
  ],
}
