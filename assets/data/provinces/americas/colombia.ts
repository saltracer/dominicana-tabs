import type { Province } from "@/types"
import { colombiaBoundaries } from "./colombia-boundaries"

export const colombiaProvince: Province = {
  id: "colombia",
  name: "Province of St. Louis Bertrand in Colombia",
  formation_date: "1551",
  region: "Colombia",
  region_expanded: "Colombia (All departments)",
  countries: ["Colombia"],
  website: "https://www.dominicos.co/",
  lay_website: "https://www.dominicos.co/laicos-dominicos/",
  short_description: "One of the oldest provinces in South America, known for its educational institutions.",
  description:
    "The Province of St. Louis Bertrand in Colombia was established in 1551 and is one of the oldest provinces in South America. It is known for its educational institutions, including the Universidad Santo Tomás.",
  description_array: [
    "The Province of St. Louis Bertrand in Colombia was established in 1551, making it one of the oldest Dominican provinces in the Americas. It is named after the Spanish Dominican missionary who evangelized parts of Colombia and was known for his defense of indigenous peoples.",
    "From its earliest days, the province has been committed to education. In 1580, the Dominicans founded the Universidad Santo Tomás in Bogotá, the first university in Colombia and one of the oldest in the Americas. This institution continues to be a flagship of Dominican education in South America.",
    "The province has played a significant role in Colombia's intellectual and cultural life throughout its history. Dominican scholars have contributed to theology, philosophy, law, and the sciences, helping to shape Colombian national identity and educational traditions.",
    "During Colombia's turbulent political history, the province has often served as a mediating presence, working for peace and reconciliation. In recent decades, as Colombia has experienced civil conflict, Dominicans have been involved in peace processes and supporting communities affected by violence.",
    "The province maintains a strong commitment to social justice, with friars working in both urban and rural areas to address issues of poverty, land rights, and environmental concerns. This work is seen as an extension of the early Dominicans' defense of indigenous communities.",
    "Today, the Province of St. Louis Bertrand continues to evolve, developing new forms of ministry while maintaining its historic commitments to education, preaching, and social justice. It remains one of the most vibrant Dominican provinces in Latin America, with a steady stream of vocations.",
  ],
  coordinates: [4.711, -74.0721], // Bogotá coordinates
  boundaries: colombiaBoundaries, // Using imported boundaries
  color: "#FCD116", // Yellow from the Colombian flag
}
