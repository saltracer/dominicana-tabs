import type { Province } from "@/types"
import { maltaBoundaries } from "./malta-boundaries"

export const maltaProvince: Province = {
  id: "malta",
  name: "Malta",
  latinName: "Provincia Melitensis",
  patronSaint: "Our Lady of the Grotto",
  formation_date: 1569,
  website: "https://www.dominicans-malta.org",
  boundaries: maltaBoundaries,
  coordinates: [35.882, 14.3988], // Ir-Rabat, Malta
  region: "europe",
  region_expanded: "Europe",
  countries: ["Malta"],
  color: "#CF142B", // Red from Maltese flag
  short_description:
    "The Maltese Dominican Province, centered around the Sanctuary of Our Lady of the Grotto, has been a spiritual and cultural landmark in Malta since 1569.",
  description:
    "The Maltese Dominican Province has a history dating back to the 16th century. The province has been influential in Maltese religious and cultural life, particularly through its devotion to Our Lady of the Grotto.",
  description_array: [
    "The Maltese Dominican Province was established in 1569, though Dominicans had been present on the island since the 14th century. The province is centered around the Sanctuary of Our Lady of the Grotto in Rabat, a major pilgrimage site.",
    "During the rule of the Knights of St. John (1530-1798), the Dominicans in Malta enjoyed patronage and protection, allowing them to build impressive churches and convents. They played a significant role in the island's defense against Ottoman invasions through prayer and pastoral support.",
    "The province has survived various historical challenges, including the brief Napoleonic occupation and British colonial rule. Throughout these periods, the Maltese Dominicans maintained their distinctive identity and continued their ministry to the local population.",
    "Today, the Maltese Dominican Province continues its centuries-old traditions while adapting to contemporary needs. The province is particularly known for its devotion to Our Lady, its cultural heritage, and its educational and pastoral work among the Maltese people.",
  ],
  priories: [
    {
      name: "Convent of St. Mary of the Grotto",
      location: "Rabat",
      coordinates: [35.8815, 14.3989],
      founded: 1450,
      isProvincialHouse: true,
    },
    {
      name: "Convent of the Annunciation",
      location: "Valletta",
      coordinates: [35.8989, 14.5146],
      founded: 1571,
    },
    {
      name: "Convent of St. Dominic",
      location: "Vittoriosa",
      coordinates: [35.8886, 14.5236],
      founded: 1528,
    },
  ],
}
