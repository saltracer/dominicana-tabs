import type { Province } from "@/types"
import { stJosephBoundaries } from "./st-joseph-boundaries"

export const stJosephProvince: Province = {
  id: "st-joseph",
  name: "Province of St. Joseph",
  formation_date: "1805",
  region: "Eastern United States",
  region_expanded:
    "Eastern United States (Maine, New Hampshire, Vermont, Massachusetts, Rhode Island, Connecticut, New York, New Jersey, Pennsylvania, Delaware, Maryland, Virginia, West Virginia, Ohio, Kentucky)",
  countries: ["United States"],
  website: "https://opeast.org/",
  lay_website: "https://opeast.org/lay-dominicans/",
  short_description: "The oldest Dominican province in the United States, covering the eastern region.",
  description:
    "The Province of St. Joseph covers the eastern United States and was established in 1805. It is known for its academic institutions, including the Dominican House of Studies in Washington, D.C., and Providence College in Rhode Island.",
  description_array: [
    "The Province of St. Joseph, established in 1805, is the oldest Dominican province in the United States. It began when Edward Fenwick, an American-born Dominican educated in Europe, returned to his homeland with a vision of establishing the Order of Preachers in the young nation.",
    "Initially focused on frontier ministry in Kentucky and Ohio, the province gradually expanded throughout the eastern United States. The friars were instrumental in serving immigrant Catholic communities, particularly Irish and German Catholics who faced significant discrimination in 19th century America.",
    "Education has been a hallmark of the province since its earliest days. In 1829, the province founded the first Catholic university in Ohio, which later became Xavier University. In 1917, they established Providence College in Rhode Island, which remains one of the premier Catholic liberal arts colleges in the country.",
    "The Dominican House of Studies in Washington, D.C., founded in 1905, has been the intellectual center of the province for over a century. It has produced numerous theologians, philosophers, and scholars who have made significant contributions to Catholic thought in America.",
    "Today, the Province of St. Joseph continues its mission of preaching through parishes, campus ministries, healthcare chaplaincies, and various forms of media evangelization. The province has experienced a notable increase in vocations in recent decades, bucking broader trends in religious life.",
    "The province maintains a strong commitment to the traditional Dominican charism, with an emphasis on communal prayer, study, and the wearing of the distinctive white habit. This rootedness in tradition, combined with innovative approaches to ministry, has allowed the province to remain vibrant in a rapidly changing religious landscape.",
  ],
  coordinates: [38.9072, -77.0369], // Washington, D.C. coordinates
  boundaries: stJosephBoundaries,
  color: "#041E42", // Dark blue from the US flag
}
