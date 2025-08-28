import type { Province } from "@/types"
import { brazilBoundaries } from "./brazil-boundaries"

export const brazilProvince: Province = {
  id: "brazil",
  name: "Province of São Tomás de Aquino of Brazil",
  formation_date: 1952,
  region: "Brazil",
  region_expanded: "Brazil",
  countries: ["Brazil"],
  website: "https://www.dominicanos.org.br",
  lay_website: "https://leigos.dominicanos.org.br",
  color: "#009C3B", // Green from the Brazilian flag
  province_saint: "St. Thomas Aquinas",
  province_saint_feast_day: "January 28",
  short_description:
    "The Dominican Province of São Tomás de Aquino serves the people of Brazil through education, parish ministry, and social justice work.",
  description:
    "The Dominican Province of São Tomás de Aquino was established in Brazil in 1952, although Dominicans had been present in the country since the 19th century, particularly French Dominicans who arrived in 1881. The province has a strong commitment to education, social justice, and evangelization in the world's largest Catholic country. With a vast territory to serve, the Brazilian Dominicans focus on urban ministry in major cities like São Paulo and Rio de Janeiro, as well as missionary work in the Amazon region. The province is known for its progressive theological perspectives and commitment to the poor and marginalized.",
  description_array: [
    "The Dominican Province of São Tomás de Aquino was established in Brazil in 1952, although Dominicans had been present in the country since the 19th century, particularly French Dominicans who arrived in 1881.",
    "The province has a strong commitment to education, social justice, and evangelization in the world's largest Catholic country.",
    "With a vast territory to serve, the Brazilian Dominicans focus on urban ministry in major cities like São Paulo and Rio de Janeiro, as well as missionary work in the Amazon region.",
    "The province is known for its progressive theological perspectives and commitment to the poor and marginalized.",
    "During the military dictatorship (1964-1985), many Dominican friars were persecuted for their defense of human rights and democracy.",
  ],
  coordinates: [-23.5505, -46.6333],
  boundaries: brazilBoundaries,
  priories: [
    {
      name: "Convento São Tomás de Aquino",
      location: "São Paulo",
      founded: 1938,
      description: "The provincial house and center for Dominican studies in Brazil's largest city.",
    },
    {
      name: "Convento Santo Alberto Magno",
      location: "Rio de Janeiro",
      founded: 1927,
      description: "Important center for Dominican ministry in Rio de Janeiro, with focus on university ministry.",
    },
    {
      name: "Convento Nossa Senhora do Rosário",
      location: "Belo Horizonte",
      founded: 1952,
      description: "Center for Dominican formation and education in Minas Gerais state.",
    },
  ],
  notable_dominicans: [
    {
      name: "Fr. Frei Betto (Carlos Alberto Libânio Christo)",
      dates: "1944-present",
      description:
        "Prominent liberation theologian, writer, and political activist who was imprisoned during the military dictatorship.",
    },
    {
      name: "Fr. Tito de Alencar Lima",
      dates: "1945-1974",
      description:
        "Dominican friar who was tortured during the military dictatorship and later died in exile, becoming a symbol of resistance.",
    },
    {
      name: "Fr. Dominique Carré de Malberg",
      dates: "1896-1976",
      description:
        "French Dominican missionary who helped establish the Dominican presence in central Brazil and worked with indigenous communities.",
    },
  ],
  apostolates: [
    "Higher education and university ministry",
    "Parish ministry in urban centers",
    "Social justice work and human rights advocacy",
    "Missionary work in the Amazon region",
    "Publications and media apostolate",
  ],
}
