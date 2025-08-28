import type { Province } from "@/types"
import { irelandBoundaries } from "./ireland-boundaries"

export const irelandProvince: Province = {
  id: "ireland",
  name: "Ireland",
  latinName: "Provincia Hiberniae",
  patronSaint: "St. Patrick",
  formation_date: 1224,
  website: "https://www.dominicans.ie",
  boundaries: irelandBoundaries,
  coordinates: [53.2882, -6.3576], // Tallaght (A suburb of Dublin)
  region: "Ireland",
  region_expanded: "Ireland (Southern Ireland)",
  countries: ["Ireland", "Southern Ireland"],
  color: "#009A49", // Green from Irish flag
  short_description:
    "The Irish Dominican Province, one of the oldest in the Order, has maintained a continuous presence in Ireland since 1224 despite periods of persecution.",
  description:
    "The Irish Dominican Province is one of the oldest in the Order, dating back to the 13th century. The province has played a significant role in Irish religious and cultural life, particularly during periods of persecution.",
  description_array: [
    "The Irish Dominican Province was established in 1224, just eight years after the confirmation of the Order. The first foundation was in Dublin, and the province quickly expanded throughout the island, establishing priories in major towns and cities.",
    "During the Reformation and subsequent centuries of English rule, Irish Dominicans faced severe persecution. Many friars were martyred, and the Order was forced to operate clandestinely. Despite these challenges, the province maintained a continuous presence in Ireland.",
    "The 19th century saw a revival of the province with the Catholic Emancipation. New priories were established, and the Irish Dominicans expanded their ministry to education and missionary work, sending friars to Australia, New Zealand, and the United States.",
    "Today, the Irish Dominican Province continues its tradition of preaching and teaching. The province is known for its liturgical tradition, intellectual apostolate, and commitment to justice and peace. Irish Dominicans remain active in parish ministry, education, and publishing.",
  ],
  priories: [
    {
      name: "St. Saviour's Priory",
      location: "Dublin",
      coordinates: [53.3498, -6.2603],
      founded: 1224,
      isProvincialHouse: true,
    },
    {
      name: "Holy Cross Priory",
      location: "Cork",
      coordinates: [51.8979, -8.4706],
      founded: 1229,
    },
    {
      name: "St. Mary's Priory",
      location: "Galway",
      coordinates: [53.2707, -9.0568],
      founded: 1488,
    },
  ],
}
