import { Celebration, FixedCelebration, CelebrationRank } from "@/types/celebrations-types"
export { CelebrationRank }
export type { Celebration, FixedCelebration }

import { fixedGeneralCelebrations } from "./celebrations-fixed-general"

import { moveableGeneralCelebrations } from "./celebrations-moveable-general"

import { fixedDominicanCelebrations } from "./celebrations-fixed-dominican"

import { moveableDominicanCelebrations } from "./celebrations-moveable-dominican"

// Combined functions for convenience
export function getAllFixedCelebrations(): FixedCelebration[] {
  //console.log("getAllFixedCelebrations, which includes General and Dominican")
  return [...fixedGeneralCelebrations(), ...fixedDominicanCelebrations()]
}

export function getAllMoveableCelebrations(year: number): FixedCelebration[] {
  //console.log("getAllMoveableCelebrations, which includes General and Dominican")
  return [...moveableGeneralCelebrations(year), ...moveableDominicanCelebrations(year)]
}

export function getAllCelebrations(year: number): FixedCelebration[] {
  //console.log("getAllCelebrations, which includes Fixed and Moveable")
  return [...getAllFixedCelebrations(), ...getAllMoveableCelebrations(year)]
}

export {
  fixedGeneralCelebrations,
  moveableGeneralCelebrations,
}



/*


// Get all celebrations for a specific date
export function getMoveableCelebrations(year: number): Celebration[] {
  try {
    const moveable = moveableGeneralCelebrations(year)
    return moveable.map((celebration) => {
      try {
        // Parse the date string into month and day
        const dateParts = celebration.date.toString().split("-")
        const month = Number.parseInt(dateParts[0], 10) - 1 // 0-indexed month
        const day = Number.parseInt(dateParts[1], 10)

        // Create a date object
        const celebrationDate = new Date(year, month, day)

        // Format the date as MM-dd-yyyy
        const formattedDate = format(celebrationDate, "MM-dd-yyyy")
        return {
          name: celebration.name,
          rank: celebration.rank as CelebrationRank,
          color: celebration.color.toLowerCase(),
          date: formattedDate,
          isDominican: celebration.type === "dominican" || celebration.type === "both",
          description: Array.isArray(celebration.description)
            ? celebration.description.join(" ")
            : celebration.description || celebration.short_desc,
        }
      } catch (error) {
        console.error("Error formatting celebration date:", error, celebration)
        // Return a default object with the original date string
        return {
          name: celebration.name,
          rank: celebration.rank as CelebrationRank,
          color: celebration.color.toLowerCase(),
          date: `${celebration.date.toString()}-${year}`,
          isDominican: celebration.type === "dominican" || celebration.type === "both",
          description: "Error formatting date",
        }
      }
    })
  } catch (error) {
    console.error("Error in getMoveableCelebrations:", error)
    return []
  }
}
*/