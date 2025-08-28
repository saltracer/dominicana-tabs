import type { Province } from "@/types"
import { australiaNewZealandProvinceBoundaries } from "./australia-new-zealand-boundaries"

export const australiaNewZealandProvince: Province = {
  id: "australia-new-zealand",
  name: "Province of the Assumption of the Blessed Virgin Mary",
  formation_date: "1950",
  region: "Oceania",
  region_expanded: "Oceania (Australia, New Zealand, Solomon Islands, Papua New Guinea)",
  countries: ["Australia", "New Zealand", "Solomon Islands", "Papua New Guinea"],
  website: "https://www.op.org.au",
  lay_website: "https://www.op.org.au/lay-dominicans",
  short_description: "Dominican Province covering Australia, New Zealand, Papua New Guinea, and Solomon Islands",
  description:
    "The Dominican Province of Australia and New Zealand was established in 1950. It evolved from the Irish Province's mission, which had been present in Australia since 1898. The Provincial House is in Melbourne, Australia. The friars are engaged in education, parish ministry, and chaplaincy work throughout Australia and New Zealand. They operate several educational institutions and are involved in intellectual apostolates.",
  description_array: [
    "The Dominican Province of Australia and New Zealand was established in 1950.",
    "It evolved from the Irish Province's mission, which had been present in Australia since 1898.",
    "The Provincial House is in Melbourne, Australia.",
    "The friars are engaged in education, parish ministry, and chaplaincy work throughout Australia and New Zealand.",
    "They operate several educational institutions and are involved in intellectual apostolates.",
  ],
  coordinates: [-37.8136, 144.9631], // Melbourne, Australia
  boundaries: australiaNewZealandProvinceBoundaries, // Using imported boundaries
  color: "#00843D", // Green representing the Australian landscape
  province_saint: "Our Lady of the Assumption",
  province_saint_feast_day: "August 15",
  notable_dominicans: [
    {
      name: "Fr. Thomas Lawrason",
      dates: "1867-1945",
      description: "Established the first Dominican foundation in Australia",
    },
    {
      name: "Fr. Bede Jarrett",
      dates: "1881-1934",
      description: "English Dominican who visited Australia and inspired many vocations",
    },
    {
      name: "Fr. Paul Chandler",
      dates: "1950-present",
      description: "Known for his work in social justice and indigenous ministry",
    },
  ],
}
