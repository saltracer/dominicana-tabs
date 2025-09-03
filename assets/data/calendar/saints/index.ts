
import { format } from "date-fns"

import type { Saint } from "./saint-types"
import { CelebrationRank } from "../celebrations"
import type { Celebration } from "../celebrations"

import { dominicanSaints } from "./saint-dominicans"
import { doctorSaints } from "./doctors"

// Import saint data from monthly files
import { januaryGeneralSaints } from "./january"
import { februaryGeneralSaints } from "./february"
import { marchGeneralSaints } from "./march"
import { aprilGeneralSaints } from "./april"
import { mayGeneralSaints } from "./may"
import { juneGeneralSaints } from "./june"
import { julyGeneralSaints } from "./july"
import { augustGeneralSaints } from "./august"
import { septemberGeneralSaints } from "./september"
import { octoberGeneralSaints } from "./october"
import { novemberGeneralSaints } from "./november"
import { decemberGeneralSaints } from "./december"

// Combine all generalsaints data
export const generalSaints: Saint[] = [
  ...januaryGeneralSaints,
  ...februaryGeneralSaints,
  ...marchGeneralSaints,
  ...aprilGeneralSaints,
  ...mayGeneralSaints,
  ...juneGeneralSaints,
  ...julyGeneralSaints,
  ...augustGeneralSaints,
  ...septemberGeneralSaints,
  ...octoberGeneralSaints,
  ...novemberGeneralSaints,
  ...decemberGeneralSaints,
]

// Combine all saints data
export const allSaints: Saint[] = [
  ...dominicanSaints,
  ...doctorSaints,
  ...generalSaints,
]

// Function to get saints for a specific date
export function getSaintsForDate(date: Date): Celebration[] {
  try {
    const formattedDate = format(date, "MM-dd")

    // Get Dominican saints for this date
    const dominicanSaintsForDate = dominicanSaints.filter((saint) => saint.feast_day === formattedDate)

    // Get Doctor saints for this date
    const doctorSaintsForDate = doctorSaints.filter((saint) => saint.feast_day === formattedDate)

    // Get general saints for this date
    const generalSaintsForDate = generalSaints.filter((saint) => saint.feast_day === formattedDate)

    const saintsForDate = [...dominicanSaintsForDate, ...doctorSaintsForDate, ...generalSaintsForDate]

    // Convert saints to celebrations with more detailed information
    const saintCelebrations = saintsForDate.map((saint) => ({
      id: saint.id || `saint-${saint.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: saint.name,
      rank: (saint.rank as CelebrationRank) || CelebrationRank.OPTIONAL_MEMORIAL,
      color: saint.color?.toLowerCase() || "white",
      date: formattedDate,
      isDominican: saint.is_dominican,
      description: saint.short_bio || saint.biography?.join(" "),
      // Add more detailed information
      birthYear: saint.birth_year,
      deathYear: saint.death_year,
      patronage: saint.patronage,
      biography: saint.biography,
      prayers: saint.prayers,
      books: saint.books,
    }))

    return saintCelebrations
  } catch (error) {
    console.error("Error in getSaintsForDate:", error)
    return []
  }
}
