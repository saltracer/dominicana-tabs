import { calculateEaster } from "@/assets/data/calendar/liturgical-seasons"
import { FixedCelebration, CelebrationRank } from "@/types/celebrations-types"
import { LiturgicalColor } from "@/types/liturgical-types"

// Define the moveable Dominican feasts and celebrations
export function moveableDominicanCelebrations(year: number): FixedCelebration[] {
  const easterDate = calculateEaster(year)

  // Calculate Tuesday after Easter (for Our Lady of the Rosary in Eastertide)
  const tuesdayAfterEasterDate = new Date(easterDate)
  tuesdayAfterEasterDate.setDate(easterDate.getDate() + 2) // 2 days after Easter
  const tuesdayMonth = tuesdayAfterEasterDate.getMonth() + 1
  const tuesdayDay = tuesdayAfterEasterDate.getDate()
  const tuesdayString = `${tuesdayMonth.toString().padStart(2, "0")}-${tuesdayDay.toString().padStart(2, "0")}`

  return [
    // Currently commented out, but adding descriptions for future use
    {
      id: "our-lady-of-rosary-eastertide",
      name: "Our Lady of the Rosary in Eastertide",
      date: tuesdayString,
      rank: CelebrationRank.MEMORIAL,
      color: LiturgicalColor.WHITE,
      proper: "Proper of Dominican Saints",
      type: "dominican",
      short_desc: "Honors Mary's role in the Easter mystery through the devotion of the Rosary.",
      description: [
        "This Dominican memorial honors the Blessed Virgin Mary under the title of Our Lady of the Rosary during the Easter season.",
        "It recognizes Mary's joy in the resurrection of her Son and her role in the Easter mystery.",
        "The Rosary, with its contemplation of the mysteries of Christ's life, death, and resurrection, is a distinctively Dominican devotion that St. Dominic is traditionally credited with propagating.",
        "This celebration during Eastertide emphasizes the joyful and glorious aspects of the Rosary and invites Dominicans to deepen their devotion to Mary as they rejoice in the resurrection of Christ.",
      ],
    },
  ]
}
