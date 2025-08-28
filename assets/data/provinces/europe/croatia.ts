import type { Province } from "@/types"
import { croatiaBoundaries } from "./croatia-boundaries"

export const croatiaProvince: Province = {
  id: "croatia",
  name: "Croatia",
  latinName: "Provincia Croatiae",
  patronSaint: "St. Dominic",
  formation_date: 1380,
  website: "https://www.dominikanci.hr",
  boundaries: croatiaBoundaries,
  coordinates: [42.6507, 18.0944], // Dubrovnik
  region: "europe",
  region_expanded: "Europe",
  countries: ["Croatia"],
  color: "#0F4C81", // Blue from Croatian coat of arms
  short_description:
    "The Croatian Dominican Province has been present along the Adriatic coast since the 13th century, with a rich tradition of scholarship and preaching.",
  description:
    "The Croatian Dominican Province has a long history dating back to the 14th century. The province has played an important role in the religious and cultural life of Croatia, particularly in the coastal regions of Dalmatia.",
  description_array: [
    "The Croatian Dominican Province was officially established in 1380, although Dominicans had been present in the region since the early 13th century, with the first foundation in Dubrovnik dating to 1225.",
    "Throughout the medieval period, the Croatian Dominicans were known for their scholarly work and their role in defending the Dalmatian coast against Ottoman expansion. The province maintained strong connections with Italy and was a bridge between Eastern and Western Christianity.",
    "During the Renaissance, Dominican friars from Croatia made significant contributions to art, literature, and theology. The province suffered during the Napoleonic period and later under Communist rule but maintained its presence.",
    "Today, the Croatian Dominican Province continues its mission through pastoral work, education, and cultural activities. The province is particularly known for its beautiful historic convents along the Adriatic coast, which attract pilgrims and tourists alike.",
  ],
  priories: [
    {
      name: "Convent of St. Dominic",
      location: "Zagreb",
      coordinates: [45.815, 15.9819],
      founded: 1479,
      isProvincialHouse: true,
    },
    {
      name: "Convent of St. Nicholas",
      location: "Dubrovnik",
      coordinates: [42.6507, 18.0944],
      founded: 1225,
    },
    {
      name: "Convent of St. Catherine",
      location: "Split",
      coordinates: [43.5081, 16.4402],
      founded: 1345,
    },
  ],
}
