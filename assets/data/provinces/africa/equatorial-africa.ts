import type { Province } from "@/types"
import { equatorialAfricaProvinceBoundaries } from "./equatorial-africa-boundaries"

export const equatorialAfricaProvince: Province = {
  id: "equatorial-africa",
  name: "Province of St Charles Lwanga in Equatorial Africa",
  formation_date: "2022",
  region: "Equatorial Africa",
  region_expanded: "Equatorial Africa (Cameroon, Republic of Congo, Central African Republic, Republic of Chad, Gabon)",
  countries: ["Cameroon", "Republic of Congo", "Central African Republic", "Republic of Chad", "Gabon"],
  website: "https://www.dominicains-afrique.org",
  short_description: "Dominican Province serving Cameroon, Republic of Congo, CAR, Chad, and Gabon.",
  description:
    "The Province of St Charles Lwanga in Equatorial Africa is the youngest Dominican province on the African continent, established in 2022. It serves a vast and diverse region marked by both rich cultural traditions and significant challenges, including poverty, conflict, and political instability. The friars are committed to bringing the light of the Gospel to these nations through education, parish ministry, and peace-building initiatives.",
  description_array: [
    "The Dominican Order has a long history of presence in Equatorial Africa, with individual friars and small communities serving in various countries for many years. However, it was not until 2022 that these efforts were consolidated into a single, autonomous province, reflecting the growth and maturity of the Dominican presence in the region.",
    "The Province is named after St. Charles Lwanga, one of the Uganda Martyrs, a group of young Christian converts who were martyred for their faith in the late 19th century. This patronage reflects the Province's commitment to evangelization and its solidarity with the African people.",
    "The Province serves the countries of Cameroon, Republic of Congo, Central African Republic, Republic of Chad, and Gabon, a region characterized by diverse cultures, languages, and religious traditions. The friars are engaged in interreligious dialogue and work to promote understanding and cooperation among different faith communities.",
    "Education is a key focus of the Province's ministry, with Dominicans operating schools and educational centers that serve students from diverse backgrounds. These institutions aim to provide quality education that is rooted in Christian values and promotes critical thinking and social responsibility.",
    "In addition to education, the friars are involved in parish ministry, providing pastoral care and administering the sacraments to Catholic communities throughout the region. They also engage in social justice initiatives, working to address issues of poverty, inequality, and human rights.",
    "Given the history of conflict and instability in many parts of Equatorial Africa, the Province is committed to peace-building and reconciliation. The friars work to promote dialogue, understanding, and forgiveness among different ethnic and religious groups, seeking to create a more just and peaceful society.",
  ],
  coordinates: [4.0511, 9.7679], // Douala, Cameroon??
  boundaries: equatorialAfricaProvinceBoundaries, // Using imported boundaries
  province_saint: "St. Charles Lwanga",
  province_saint_feast_day: "June 3",
  color: "#006633", // Updated: Forest green representing the equatorial forests
}
