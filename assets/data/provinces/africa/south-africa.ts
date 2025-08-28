import type { Province } from "@/types"
import { southAfricaProvinceBoundaries } from "./south-africa-boundaries"

export const southAfricaProvince: Province = {
  id: "south-africa",
  name: "Vice-Province of Southern Africa",
  formation_date: "1968",
  region: "Southern Africa",
  region_expanded: "Southern Africa (South Africa, Zimbabwe, Malawi)",
  countries: ["South Africa", "Zimbabwe", "Malawi"],
  website: "https://www.dominicans.co.za",
  short_description: "Dominican Vice-Province serving South Africa, Zimbabwe, and Malawi.",
  description:
    "The Vice-Province of Southern Africa has a unique history shaped by the complexities of the region. Established in 1968, it evolved from the English Province's mission and has been deeply involved in addressing the social and political issues of Southern Africa, particularly the legacy of apartheid. The friars are engaged in parish ministry, education, and social justice work, striving to promote reconciliation and equality in the region.",
  description_array: [
    "The Dominican presence in Southern Africa began as a mission of the English Province, with friars arriving to minister to the European settler population. Over time, the Dominicans expanded their ministry to include the indigenous African population, often facing challenges and resistance from the colonial authorities.",
    "In 1968, the Dominican mission in Southern Africa was elevated to a Vice-Province, recognizing its growth and increasing autonomy. The Vice-Province has been deeply shaped by the social and political conflicts of the region, particularly the apartheid regime in South Africa and the struggle for independence in Zimbabwe and Malawi.",
    "During the apartheid era, Dominican friars played a significant role in opposing racial segregation and advocating for social justice. Many friars worked closely with anti-apartheid activists and provided support to communities affected by discriminatory laws and violence.",
    "Today, the Vice-Province is committed to reconciliation and transformation, working to heal the wounds of the past and build a more just and equitable society. The friars are engaged in various ministries, including parish work, education, healthcare, and community development.",
    "The Vice-Province also faces the challenges of poverty, inequality, and HIV/AIDS, which disproportionately affect marginalized communities in Southern Africa. The friars are actively involved in addressing these issues through education, advocacy, and direct service to those in need.",
    "Despite the challenges, the Vice-Province of Southern Africa remains a vibrant and hope-filled presence in the region, committed to living out the Dominican charism of preaching the Gospel and serving the poor and marginalized.",
  ],
  coordinates: [-26.2041, 28.0473], // Johannesburg, South Africa
  boundaries: southAfricaProvinceBoundaries, // Using imported boundaries
  province_saint: "St. Dominic",
  province_saint_feast_day: "August 8",
  color: "#FFB612", // Updated: Gold color from South African flag
}
