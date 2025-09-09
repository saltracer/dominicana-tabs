import { addDays, format, getYear, isEqual, isSunday, parseISO, isSameDay } from "date-fns"
import { type Celebration, CelebrationRank } from "@/types/celebrations-types"
import { getLiturgicalSeason, getLiturgicalWeek } from "@/assets/data/calendar/liturgical-seasons"
import { getAllCelebrations } from "./celebrations"
import { getSaintsForDate } from "./saints"

export interface CalendarDay {
  date: Date
  celebrations: Celebration[]
  season: string
  week: string
}

export function getCelebrationsForDate(date: Date): Celebration[] {
  try {
    const year = getYear(date)
    const formattedDate = format(date, "MM-dd")
    const isoDate = format(date, "yyyy-MM-dd")

    // Get fixed celebrations (saints) - but not if it's a Sunday
    const saints = isSunday(date) ? [] : getSaintsForDate(date)

    // Get moveable celebrations (Easter, Pentecost, etc.)
    const allCelebrations = getAllCelebrations(year)

    // Find if there's a moveable celebration on this date
    const moveable = allCelebrations.filter((celebration) => {
      try {
        // Convert celebration date to ISO format
        const celebrationDate = parseISO(`${year}-${celebration.date}`)
        return isSameDay(celebrationDate, date)
      } catch (error) {
        console.error("Error parsing celebration date:", error)
        return false
      }
    }).map(celebration => ({
      id: celebration.id,
      name: celebration.name,
      rank: celebration.rank,
      color: celebration.color.toLowerCase(),
      date: celebration.date,
      isDominican: celebration.type === "dominican" || celebration.type === "both",
      description: Array.isArray(celebration.description) 
        ? celebration.description 
        : celebration.short_desc || ""
    }));

    // Combine all celebrations
    let celebrations = [...saints, ...moveable]
    // If no celebrations, add a ferial day
    if (celebrations.length === 0) {
      const season = getLiturgicalSeason(date)
      const weekInfo = getLiturgicalWeek(date, season)
      const currentIsoDate = format(date, "yyyy-MM-dd")

      celebrations = [
        {
          id: `Ferial-${currentIsoDate}`,
          name: `${season.name} Weekday`,
          rank: CelebrationRank.FERIAL,
          color: season.color.toLowerCase(),
          date: currentIsoDate,
          isDominican: false,
          description: `Ferial day in ${season.name}, ${weekInfo}`,
        },
      ]
    }

    // Helper function to safely parse and format dates for comparison
    const safeFormatDate = (dateStr: string): string => {
      try {
        // First try to parse as full date
        const parsed = parseISO(dateStr);
        if (!isNaN(parsed.getTime())) {
          return format(parsed, 'MM-dd');
        }
        
        // If that fails, try to parse as MM-DD format
        if (/^\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr; // Already in MM-DD format
        }
        
        return '12-31'; // Default to end of year for invalid dates
      } catch (error) {
        return '12-31'; // Default to end of year for invalid dates
      }
    };

    // Sort celebrations by importance
    celebrations.sort((a, b) => {
      const typeOrder: Record<string, number> = {
        [CelebrationRank.SOLEMNITY]: 1,
        [CelebrationRank.FEAST]: 2,
        [CelebrationRank.MEMORIAL]: 3,
        [CelebrationRank.OPTIONAL_MEMORIAL]: 4,
        [CelebrationRank.FERIAL]: 5,
      };

      // Get the numeric rank for each celebration with fallback
      const rankA = a.rank in typeOrder ? typeOrder[a.rank] : 5;
      const rankB = b.rank in typeOrder ? typeOrder[b.rank] : 5;

      // If ranks are equal, sort by date
      if (rankA === rankB) {
        const dateA = safeFormatDate(a.date);
        const dateB = safeFormatDate(b.date);
        return dateA < dateB ? -1 : 1;
      }

      return rankA - rankB;
    });

    return celebrations
  } catch (error) {
    console.error("Error in getCelebrationsForDate:", error)
    // Return a default ferial day instead of empty array
    const currentIsoDate = format(date, "yyyy-MM-dd")
    return [
      {
        id: `Ferial-${currentIsoDate}`,
        name: "Ordinary Time Weekday",
        rank: CelebrationRank.FERIAL,
        color: "green",
        date: format(date, "MM-dd"),
        isDominican: false,
        description: "Ferial day in Ordinary Time",
      },
    ]
  }
}

export function getCalendarMonth(year: number, month: number): CalendarDay[] {
  const result: CalendarDay[] = []

  try {
    // Create a date for the first day of the month
    const startDate = new Date(year, month - 1, 1)

    // Create a date for the last day of the month
    const endDate = new Date(year, month, 0)

    // Loop through each day of the month
    let currentDate = startDate
    while (currentDate <= endDate) {
      const celebrations = getCelebrationsForDate(currentDate)
      const season = getLiturgicalSeason(currentDate)
      const week = getLiturgicalWeek(currentDate, season)

      result.push({
        date: new Date(currentDate),
        celebrations,
        season: season.name,
        week,
      })

      // Move to the next day
      currentDate = addDays(currentDate, 1)
    }
  } catch (error) {
    console.error("Error in getCalendarMonth:", error)
  }

  return result
}

export function getCalendarYear(year: number): CalendarDay[] {
  const result: CalendarDay[] = []

  try {
    // Loop through each month
    for (let month = 1; month <= 12; month++) {
      result.push(...getCalendarMonth(year, month))
    }
  } catch (error) {
    console.error("Error in getCalendarYear:", error)
  }

  return result
}

export function getSpecialSeasonClass(date: Date): string {
  try {
    const season = getLiturgicalSeason(date)

    if (season.name === "Lent") return "lent"
    if (season.name === "Easter") return "easter"
    if (season.name === "Pentecost") return "pentecost"
    return ""
  } catch (error) {
    console.error("Error in getSpecialSeasonClass:", error)
    return ""
  }
}
