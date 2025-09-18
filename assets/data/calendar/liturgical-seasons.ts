import { isSameDay } from "date-fns"

// Helper function to get day of year (1-366)
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Helper function to check if a year is a leap year
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

// Helper function to get Ash Wednesday day of year
function getAshWednesdayYday(year: number): number {
  const ashWednesday = getAshWednesday(year)
  return getDayOfYear(ashWednesday)
}

// Helper function to calculate new liturgical year start (First Sunday of Advent day of year)
function getNewLiturgicalYearYday(year: number): number {
  const christmas = new Date(year, 11, 25)
  const christmasYday = getDayOfYear(christmas)
  const christmasWday = christmas.getDay()
  
  if (christmasWday === 0) {
    // Christmas is Sunday (line 237 in Perl)
    return christmasYday - 28
  } else {
    // Christmas is not Sunday (line 241 in Perl)
    return christmasYday - 21 - christmasWday
  }
}

// Helper function to get Pentecost day of year
function getPentecostYday(year: number): number {
  const pentecost = getPentecostSunday(year)
  return getDayOfYear(pentecost)
}

export type LiturgicalSeasonType = {
  name: string
  color: string
  description: string
  rank?: string
}

export interface LiturgicalSeason {
  name: string
  color: string
  description: string
  rank?: string
}

/**
 * Determines the liturgical season based on a given date
 * This is a simplified implementation that covers major seasons
 */
export function getLiturgicalSeason(date: Date): LiturgicalSeason {
  try {
    // Check if the date falls within an octave first
    const octave = getOctave(date)
    if (octave) {
      return octave
    }

    const year = date.getFullYear()
    const yday = getDayOfYear(date)
    const month = date.getMonth()
    const day = date.getDate()
    
    // Calculate Easter for the given year
    const easter = calculateEaster(year)
    const easterYday = getDayOfYear(easter)
    
    // Calculate Christmas day of year (line 222 in Perl)
    // Use actual calculation instead of hardcoded values for accuracy
    const christmasDate = new Date(year, 11, 25)
    const christmasYday = getDayOfYear(christmasDate)
    
    // Calculate other key dates (lines 229-232 in Perl)
    const ashWedYday = getAshWednesdayYday(year)
    
    const holyWeekYday = easterYday - 6
    const octaveYday = easterYday + 8
    const pentYday = getPentecostYday(year)
    
    // Calculate new liturgical year start (lines 234-242 in Perl)
    const newLitYearYday = getNewLiturgicalYearYday(year)

    // Default season
    let season: LiturgicalSeason = {
      name: "Ordinary Time",
      color: "Green",
      description: "Ordinary Time is the period in the liturgical year outside of the distinct seasons.",
      rank: "Season",
    }

    // Debug output to understand the boundaries (commented out for production)
    // console.log(`Date: ${date.toDateString()}, yday: ${yday}`);
    // console.log(`ashWedYday: ${ashWedYday}, holyWeekYday: ${holyWeekYday}, easterYday: ${easterYday}`);
    // console.log(`octaveYday: ${octaveYday}, pentYday: ${pentYday}, newLitYearYday: ${newLitYearYday}, christmasYday: ${christmasYday}`);

    // Note: Pentecost day itself is handled as a special day override below,
    // but it remains part of the Easter season in the main logic
    // Special feast day overrides (based on Perl lines 324-330, 347-367)
    if (yday === easterYday) {
      // Easter Sunday
      season = {
        name: "Easter",
        color: "White",
        description: "The celebration of the resurrection of Jesus Christ",
        rank: "Solemnity",
      }
    }
    else if (yday === pentYday) {
      // Pentecost Sunday (line 357 in Perl)
      season = {
        name: "Easter",
        color: "White",
        description: "The descent of the Holy Spirit upon the Apostles",
        rank: "Solemnity",
      }
    }
    else if (month === 11 && day === 25) {
      // Christmas Day
      season = {
        name: "Christmas",
        color: "White",
        description: "The celebration of the birth of Jesus Christ",
        rank: "Solemnity",
      }
    }
    else if (yday === newLitYearYday) {
      // First Sunday of Advent
      season = {
        name: "Advent",
        color: "Purple",
        description: "A season of preparation for the celebration of the birth of Jesus Christ",
        rank: "Season",
      }
    }
    else {
      // Calculate Baptism of the Lord
      const baptismOfLord = getBaptismOfLordSunday(year)
      const baptismYday = getDayOfYear(baptismOfLord)
      
      if (yday === baptismYday) {
        // Baptism of the Lord
        season = {
          name: "Christmas",
          color: "White",
          description: "The celebration of the birth of Jesus Christ",
          rank: "Season",
        }
      }
    }

    // Check for Christ the King using the consolidated function
    const christTheKingDate = getChristTheKingSunday(year)
    const christKingYday = getDayOfYear(christTheKingDate)
    if (yday === christKingYday) {
      // Christ the King
      season = {
        name: "Christ the King",
        color: "White",
        description: "The feast of Christ the King, last Sunday before Advent",
        rank: "Solemnity",
      }
    }

    // Apply the Perl logic exactly (lines 244-283) only if no special day was found
    // Debug: Log the current season before applying regular logic (commented out for production)
    // if (yday === 63 && year === 2025) {
    //   console.log(`Date: ${date.toDateString()}, yday: ${yday}, season before regular logic: ${season.name}`);
    // }
    if (season.name === "Ordinary Time") {
      // if (yday === 63 && year === 2025) {
      //   console.log(`Regular logic: yday=${yday}, ashWedYday=${ashWedYday}, yday < ashWedYday=${yday < ashWedYday}`);
      // }
      // Calculate Baptism of the Lord for Christmas season boundary
      const baptismOfLord = getBaptismOfLordSunday(year)
      const baptismYday = getDayOfYear(baptismOfLord)
      
      if (yday <= baptismYday) {
        season = {
          name: "Christmas",
          color: "White",
          description: "The celebration of the birth of Jesus Christ",
          rank: "Season",
        }
      } else if (yday > baptismYday && yday < ashWedYday) {
        season = {
          name: "Ordinary Time",
          color: "Green",
          description: "The ordered life of the Church",
          rank: "Season",
        }
      } else if (yday < holyWeekYday) {
        season = {
          name: "Lent",
          color: "Purple",
          description: "A season of penance, reflection, and fasting in preparation for Easter",
          rank: "Season",
        }
      } else if (yday < easterYday) {
        season = {
          name: "Holy Week",
          color: "Violet",
          description: "The week leading up to Easter",
          rank: "Season",
        }
      } else if (yday < octaveYday) {
        season = {
          name: "Octave of Easter",
          color: "White",
          description: "The eight days from Easter Sunday to the Second Sunday of Easter",
          rank: "Season",
        }
      } else if (yday <= pentYday) {
        season = {
          name: "Easter",
          color: "White",
          description: "The celebration of the resurrection of Jesus Christ",
          rank: "Season",
        }
      } else if (yday < newLitYearYday) {
        season = {
          name: "Ordinary Time",
          color: "Green",
          description: "The ordered life of the Church",
          rank: "Season",
        }
      } else if (yday < christmasYday) {
        season = {
          name: "Advent",
          color: "Purple",
          description: "A season of preparation for the celebration of the birth of Jesus Christ",
          rank: "Season",
        }
      } else {
        season = {
          name: "Christmas",
          color: "White",
          description: "The celebration of the birth of Jesus Christ",
          rank: "Season",
        }
      }
    }

    return season
  } catch (error) {
    console.error("Error in getLiturgicalSeason:", error)
    // Return a default season on error
    return {
      name: "Ordinary Time",
      color: "Green",
      description: "Default season when calculation fails.",
    }
  }
}

/**
 * Gets the week number within a liturgical season
 */
export function getLiturgicalWeek(date: Date, season?: LiturgicalSeason): string {
  // Handle case where season is undefined
  if (!season) {
    season = getLiturgicalSeason(date)
  }

  const year = date.getFullYear()
  const yday = getDayOfYear(date)
  const wday = date.getDay()

  // Calculate base week count using Perl logic (lines 202-208)
  const yearOffset = (yday - wday) % 7
  let weekCount = Math.floor((yday - yearOffset) / 7)

  if (yearOffset < 1) {
    weekCount--
  }

    // Calculate Easter and related dates
    const easter = calculateEaster(year)
    const easterYday = getDayOfYear(easter)
    
    // Calculate Ash Wednesday day of year
    const ashWedYday = getAshWednesdayYday(year)
    
    // Debug Easter calculation (commented out for production)
    // if (yday === 63 && year === 2025) {
    //   console.log(`Easter calculation debug: easter=${easter.toDateString()}, easterYday=${easterYday}, ashWedYday=${ashWedYday}`);
    //   console.log(`Boundary check: yday=${yday}, ashWedYday=${ashWedYday}, yday < ashWedYday=${yday < ashWedYday}`);
    // }
  const octaveYday = easterYday + 8
  const pentYday = getPentecostYday(year)

  // Calculate new liturgical year start for Advent calculation
  const newLitYearYday = getNewLiturgicalYearYday(year)

  if (season.name === "Advent") {
    // Calculate which Sunday of Advent (line 278 in Perl)
    const daysSinceFirstSunday = yday - newLitYearYday
    const weekOfAdvent = Math.floor(daysSinceFirstSunday / 7) + 1
    return `Week ${weekOfAdvent} of Advent`
  }

  if (season.name === "Lent") {
    // Calculate which week of Lent (lines 255-256 in Perl)
    // The -4 offset aligns with the first Sunday of Lent, but tests expect
    // week numbering to start from Ash Wednesday itself
    let weekOfLent = Math.floor((yday - ashWedYday - 3) / 7) + 1
    
    // If the result is 0 or negative, it means we're in the first week
    // (Ash Wednesday through Saturday before first Sunday)
    if (weekOfLent <= 0) {
      // Before Monday after Baptism of the Lord - use "after Epiphany" format (matches Perl line 410)
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dayName = dayNames[date.getDay()]
      return `${dayName} after Ash Wednesday`
    }
    
    return `Week ${weekOfLent} of Lent`
  }

  if (season.name === "Holy Week") {
    // Before Monday after Baptism of the Lord - use "after Epiphany" format (matches Perl line 410)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = dayNames[date.getDay()]
    return `${dayName} of Holy Week`
    //return `Holy Week`
  }

  if (season.name === "Octave of Easter") {
    return `Octave of Easter`
  }

  if (season.name === "Easter") {
    // Calculate which week of Easter (line 268 in Perl)
    const weekOfEaster = Math.floor((yday - easterYday) / 7) + 1
    return `Week ${weekOfEaster} of Easter`
  }

  // Pentecost is now part of the Easter season, so no separate handling needed

  if (season.name === "Ordinary Time") {
    // Calculate Baptism of the Lord to determine first period start
    const baptismOfLord = getBaptismOfLordSunday(year)
    const baptismYday = getDayOfYear(baptismOfLord)
    
    if (yday < baptismYday + 1) {
      // Before Monday after Baptism of the Lord - use "after Epiphany" format (matches Perl line 410)
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dayName = dayNames[date.getDay()]
      return `${dayName} after Epiphany`
    } else if (yday >= baptismYday + 1 && yday < ashWedYday) {
      // First period: Calculate weeks from Monday after Baptism of the Lord
      // In liturgical calendars, Sunday begins the new week
      const firstPeriodStart = baptismYday + 1 // Monday after Baptism of the Lord
      const daysSinceStart = yday - firstPeriodStart
      
      // Find the first Sunday after Baptism of the Lord
      const baptismDate = new Date(year, 0, 1)
      baptismDate.setDate(baptismDate.getDate() + baptismYday - 1)
      const baptismWday = baptismDate.getDay() // 0 = Sunday, 1 = Monday, etc.
      
      let firstSundayYday
      if (baptismWday === 0) {
        // If Baptism of the Lord is on Sunday, first Sunday is the next Sunday
        firstSundayYday = baptismYday + 7
      } else {
        // Find the next Sunday after Baptism of the Lord
        const daysToFirstSunday = (7 - baptismWday) % 7
        firstSundayYday = baptismYday + daysToFirstSunday
      }
      
      if (yday < firstSundayYday) {
        // Before first Sunday = Week 1 (partial week)
        return `Week 1 in Ordinary Time`
      } else {
        // After first Sunday = calculate weeks from first Sunday
        const weeksSinceFirstSunday = Math.floor((yday - firstSundayYday) / 7) + 2
        return `Week ${weeksSinceFirstSunday} in Ordinary Time`
      }
    } else if (yday >= pentYday && yday < newLitYearYday) {
      // Second period: use calendar year weekCount - 12 (matches Perl line 273)
      // This handles dropped weeks and maintains proper numbering
      weekCount = weekCount - 12
      return `Week ${weekCount} in Ordinary Time`
    }
    
    // Fallback for any other Ordinary Time dates
    return `Week ${weekCount} in Ordinary Time`
  }

  if (season.name === "Octave of Christmas") {
    return season.name
  }

  if (season.name === "Christmas") {
    // Check if this is before Baptism of the Lord - need to distinguish Epiphany boundary
    const baptismOfLord = getBaptismOfLordSunday(date.getFullYear())
    const baptismYday = getDayOfYear(baptismOfLord)
    const epiphanyYday = getDayOfYear(getEpiphanySunday(date.getFullYear())) // January 6

    
    if (yday < baptismYday) {
      // Before Baptism of the Lord - need to check Epiphany boundary
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dayName = dayNames[date.getDay()]
      
      if (yday < epiphanyYday) {
        // Before Epiphany - use "Day of Christmas" format
        return `${dayName} of Christmas`
      } else if (yday === epiphanyYday) {
        // Epiphany Day itself
        return "Epiphany"
      } else {
        // After Epiphany but before Baptism - use "after Epiphany" format
        return `${dayName} after Epiphany`
      }
    } else if (yday === baptismYday) {
      // Baptism of the Lord day itself
      return "Christmas"
    } else {
      // After Baptism of the Lord (shouldn't happen in Christmas season, but fallback)
      return "Christmas Fallback"
    }
  }

  return `Week in ${season.name}`
}

/**
 * Gets the liturgical day name (e.g., "Monday of the First Week of Advent")
 */
export function getLiturgicalDayName(date: Date): string {
  try {
    const season = getLiturgicalSeason(date)
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" })
    const week = getLiturgicalWeek(date, season)

    let dayName = ""

    // Special days

    // Check for octaves
    if (season.name === "Octave of Easter") {
      // Calculate Easter for current year
      const easter = calculateEaster(date.getFullYear())

      //if (isSameDay(date, easter)) {
      //  return "Easter Sunday"
      //}

      const dayDifference = Math.floor((date.getTime() - easter.getTime()) / (1000 * 60 * 60 * 24))

      //if (dayDifference === 7) {
      //  return "Divine Mercy Sunday (Second Sunday of Easter)"
      //}

      return `${weekday} within the Octave of Easter`
    }

    if (season.name === "Octave of Christmas") {
      // Christmas Day
      const christmas = new Date(date.getFullYear(), 11, 25)
      if (isSameDay(date, christmas)) {
        return "Christmas Day"
      }

      // January 1 - Solemnity of Mary, Mother of God
      const newYear = new Date(date.getFullYear(), 0, 1)
      if (isSameDay(date, newYear)) {
        return "Solemnity of Mary, Mother of God"
      }

      // Previous year's January 1
      const prevYearNewYear = new Date(date.getFullYear() - 1, 0, 1)
      if (isSameDay(date, prevYearNewYear)) {
        return "Solemnity of Mary, Mother of God"
      }

      return `${weekday} within the Octave of Christmas`
    }

    if (season.name === "Christmas" && date.getMonth() === 11 && date.getDate() === 25) {
      dayName = "Christmas Day"
      return dayName
    }

    // Calculate Easter for current year
    const easter = calculateEaster(date.getFullYear())

    if (
      season.name === "Easter" &&
      date.getDate() === easter.getDate() &&
      date.getMonth() === easter.getMonth() &&
      date.getFullYear() === easter.getFullYear()
    ) {
      dayName = "Easter Sunday"
      return dayName
    }

    // Regular days
    if (week) {
      dayName = `${weekday} of the ${week}`
      return dayName
    }

    dayName = `${weekday} in ${season.name}`
    return dayName
  } catch (error) {
    console.error("Error in getLiturgicalDayName:", error)
    return "Ordinary Time" // Return a default name on error
  }
}

// Calculate the date of Easter for a given year using the algorithm from the Perl implementation
export function calculateEaster(year: number): Date {
  // This matches the Perl algorithm exactly (lines 212-221)
  const B = 225 - 11 * (year % 19)
  let D = ((B - 21) % 30) + 21
  if (D > 48) {
    D--
  }
  const E = (year + Math.floor(year / 4) + D + 1) % 7
  const Q = D + 7 - E

  // Convert Q (day of March) to a Date object
  // March has 31 days, so if Q > 31, it's in April
  let month = 2 // March (0-indexed)
  let day = Q
  
  if (Q > 31) {
    month = 3 // April (0-indexed)
    day = Q - 31
  }

  // Create the Easter date
  const easterDate = new Date(year, month, day)
  
  return easterDate
}

export function calculateFirstAdventSunday(date: Date): Date {
  // Use the consolidated helper function (matches Perl lines 234-242)
  const year = date.getFullYear()
  const newLitYearYday = getNewLiturgicalYearYday(year)
  
  // Convert day of year back to Date
  const firstAdventSunday = new Date(year, 0, 1)
  firstAdventSunday.setDate(newLitYearYday)
  
  return firstAdventSunday
}

/**
 * Checks if a date falls within the Octave of Easter or Christmas
 * @param date The date to check
 * @returns Object with octave information or null if not in an octave
 */
export function getOctave(date: Date): { name: string; color: string; description: string; rank: string } | null {
  // Calculate Easter for the given year
  const easter = calculateEaster(date.getFullYear())

  // Easter Octave: Easter Sunday through the following Sunday (8 days)
  const easterOctaveEnd = new Date(easter)
  easterOctaveEnd.setDate(easter.getDate() + 7)

  // Check if date is within Easter octave (inclusive of both Easter Sunday and Divine Mercy Sunday)
  if (date >= easter && date <= easterOctaveEnd) {
    return {
      name: "Octave of Easter",
      color: "White",
      description:
        "The eight days from Easter Sunday to the Second Sunday of Easter (Divine Mercy Sunday), celebrated as one continuous feast day.",
      rank: "Solemnity I", // Highest rank to override all other celebrations
    }
  }

  // Christmas Octave: December 25 through January 1
  const christmas = new Date(date.getFullYear(), 11, 25) // December 25
  const christmasOctaveEnd = new Date(date.getFullYear(), 11, 25)
  christmasOctaveEnd.setDate(christmas.getDate() + 7) // January 1

  // Check if we're in December of the current year
  if (date >= christmas && date <= new Date(date.getFullYear(), 11, 31)) {
    return {
      name: "Octave of Christmas",
      color: "White",
      description:
        "The eight days from Christmas Day to the Solemnity of Mary, Mother of God, celebrated with special solemnity.",
      rank: "Solemnity I", // Highest rank to override all other celebrations
    }
  }

  // Check if we're in January of the following year (still in Christmas octave)
  const prevYearChristmas = new Date(date.getFullYear() - 1, 11, 25)
  const prevYearChristmasOctaveEnd = new Date(prevYearChristmas)
  prevYearChristmasOctaveEnd.setDate(prevYearChristmas.getDate() + 7)

  if (date.getMonth() === 0 && date.getDate() <= 1 && date.getFullYear() === prevYearChristmas.getFullYear() + 1) {
    return {
      name: "Octave of Christmas",
      color: "White",
      description:
        "The eight days from Christmas Day to the Solemnity of Mary, Mother of God, celebrated with special solemnity.",
      rank: "Solemnity I", // Highest rank to override all other celebrations
    }
  }

  return null
}

// Helper functions for checking specific seasons
export function isLent(date: Date): boolean {
  const season = getLiturgicalSeason(date)
  return season.name === "Lent"
}

export function isEaster(date: Date): boolean {
  const season = getLiturgicalSeason(date)
  return season.name === "Easter"
}

export function isPentecost(date: Date): boolean {
  const pentecost = getPentecostSunday(date.getFullYear())
  return isSameDay(date, pentecost)
}

// Date calculation functions
export function getAshWednesday(year: number): Date {
  const easter = calculateEaster(year)
  const ashWednesday = new Date(easter)
  ashWednesday.setDate(easter.getDate() - 46)
  return ashWednesday
}

export function getHolyWeekDates(easter: Date) {
  const palmSunday = new Date(easter)
  palmSunday.setDate(easter.getDate() - 7)
  
  const holyMonday = new Date(easter)
  holyMonday.setDate(easter.getDate() - 6)
  
  const holyTuesday = new Date(easter)
  holyTuesday.setDate(easter.getDate() - 5)
  
  const holyWednesday = new Date(easter)
  holyWednesday.setDate(easter.getDate() - 4)
  
  const holyThursday = new Date(easter)
  holyThursday.setDate(easter.getDate() - 3)
  
  const goodFriday = new Date(easter)
  goodFriday.setDate(easter.getDate() - 2)
  
  const holySaturday = new Date(easter)
  holySaturday.setDate(easter.getDate() - 1)
  
  return {
    palmSunday,
    holyMonday,
    holyTuesday,
    holyWednesday,
    holyThursday,
    goodFriday,
    holySaturday
  }
}

export function getEasterOctaveDates(easter: Date) {
  const easterMonday = new Date(easter)
  easterMonday.setDate(easter.getDate() + 1)
  
  const easterTuesday = new Date(easter)
  easterTuesday.setDate(easter.getDate() + 2)
  
  const easterWednesday = new Date(easter)
  easterWednesday.setDate(easter.getDate() + 3)
  
  const easterThursday = new Date(easter)
  easterThursday.setDate(easter.getDate() + 4)
  
  const easterFriday = new Date(easter)
  easterFriday.setDate(easter.getDate() + 5)
  
  const easterSaturday = new Date(easter)
  easterSaturday.setDate(easter.getDate() + 6)
  
  return {
    easterMonday,
    easterTuesday,
    easterWednesday,
    easterThursday,
    easterFriday,
    easterSaturday
  }
}

export function getPentecostSunday(year: number): Date {
  const easter = calculateEaster(year)
  const pentecost = new Date(easter)
  pentecost.setDate(easter.getDate() + 49) // 7 weeks after Easter
  return pentecost
}

export function getMaryMotherChurchMonday(year: number): Date {
  const pentecost = getPentecostSunday(year)
  const maryMotherChurch = new Date(pentecost)
  maryMotherChurch.setDate(pentecost.getDate() + 1) // Monday after Pentecost
  return maryMotherChurch
}

export function getLaetareSunday(year: number): Date {
  const easter = calculateEaster(year)
  const laetareSunday = new Date(easter)
  laetareSunday.setDate(easter.getDate() - 21) // 3 weeks before Easter
  return laetareSunday
}

export function getHolyThursday(year: number): Date {
  const easter = calculateEaster(year)
  const holyThursday = new Date(easter)
  holyThursday.setDate(easter.getDate() - 3)
  return holyThursday
}

export function getGoodFriday(year: number): Date {
  const easter = calculateEaster(year)
  const goodFriday = new Date(easter)
  goodFriday.setDate(easter.getDate() - 2)
  return goodFriday
}

export function getHolySaturday(year: number): Date {
  const easter = calculateEaster(year)
  const holySaturday = new Date(easter)
  holySaturday.setDate(easter.getDate() - 1)
  return holySaturday
}

export function getPalmSunday(year: number): Date {
  const easter = calculateEaster(year)
  const palmSunday = new Date(easter)
  palmSunday.setDate(easter.getDate() - 7)
  return palmSunday
}

export function getDivineMercySunday(year: number): Date {
  const easter = calculateEaster(year)
  const divineMercy = new Date(easter)
  divineMercy.setDate(easter.getDate() + 7) // 1 week after Easter
  return divineMercy
}

export function getAscensionThursday(year: number): Date {
  const easter = calculateEaster(year)
  const ascension = new Date(easter)
  ascension.setDate(easter.getDate() + 39) // 39 days after Easter (40th day counting inclusively)
  return ascension
}

export function getTrinitySunday(year: number): Date {
  const pentecost = getPentecostSunday(year)
  const trinitySunday = new Date(pentecost)
  trinitySunday.setDate(pentecost.getDate() + 7) // 1 week after Pentecost
  return trinitySunday
}

export function getCorpusChristiThursday(year: number): Date {
  const trinitySunday = getTrinitySunday(year)
  const corpusChristi = new Date(trinitySunday)
  corpusChristi.setDate(trinitySunday.getDate() + 4) // Thursday after Trinity Sunday
  return corpusChristi
}

export function getSacredHeartFriday(year: number): Date {
  const trinitySunday = getTrinitySunday(year)
  const sacredHeart = new Date(trinitySunday)
  sacredHeart.setDate(trinitySunday.getDate() + 5) // Friday after Trinity Sunday
  return sacredHeart
}

export function getChristTheKingSunday(year: number): Date {
  // Use the consolidated helper function (matches Perl lines 234-242)
  const newLitYearYday = getNewLiturgicalYearYday(year)
  
  // Christ the King is 7 days before new liturgical year start (line 363 in Perl)
  const christKingYday = newLitYearYday - 7
  
  // Convert day of year back to Date
  const christTheKing = new Date(year, 0, 1)
  christTheKing.setDate(christTheKing.getDate() + christKingYday - 1)
  
  return christTheKing
}

export function getEpiphanySunday(year: number): Date {
  // Epiphany calculation rules:
  // If January 6 is a Sunday, the Epiphany is celebrated on that day.
  // If January 6 falls on a weekday, the feast is moved to the nearest Sunday within the January 2–8 range.
  const jan6 = new Date(year, 0, 6) // January 6
  const dayOfWeek = jan6.getDay() // 0 = Sunday, 1 = Monday, etc.
  
  if (dayOfWeek === 0) {
    // January 6 is Sunday, celebrate on January 6
    return jan6
  } else {
    // January 6 is a weekday, find the nearest Sunday within January 2-8 range
    // Calculate the distance to the previous and next Sunday
    const daysToPreviousSunday = dayOfWeek
    const daysToNextSunday = 7 - dayOfWeek
    
    const previousSunday = new Date(jan6)
    previousSunday.setDate(jan6.getDate() - daysToPreviousSunday)
    
    const nextSunday = new Date(jan6)
    nextSunday.setDate(jan6.getDate() + daysToNextSunday)
    
    // Check if previous Sunday is within January 2-8 range
    if (previousSunday.getDate() >= 2 && previousSunday.getMonth() === 0) {
      return previousSunday
    } else {
      // Previous Sunday is before January 2, use next Sunday
      return nextSunday
    }
  }
}

export function getBaptismOfLordSunday(year: number): Date {
  // Baptism of the Lord calculation rules:
  // 1. Normally, celebrated on the Sunday after Epiphany
  // 2. Exception: If Epiphany falls on January 7 or 8, then celebrated the following Monday
  const epiphany = getEpiphanySunday(year)
  const epiphanyMonth = epiphany.getMonth() + 1 // JavaScript months are 0-indexed
  const epiphanyDay = epiphany.getDate()
  
  // Check if Epiphany falls on January 7 or 8
  if (epiphanyMonth === 1 && (epiphanyDay === 7 || epiphanyDay === 8)) {
    // Exception: Baptism of the Lord is the following Monday
    const baptismOfLord = new Date(epiphany)
    baptismOfLord.setDate(epiphany.getDate() + 1) // Monday after Epiphany
    return baptismOfLord
  } else {
    // Normal case: Sunday after Epiphany
    const baptismOfLord = new Date(epiphany)
    if (epiphany.getDay() !== 0) {
      // If Epiphany is not Sunday, find the next Sunday
      const daysToNextSunday = 7 - epiphany.getDay()
      baptismOfLord.setDate(epiphany.getDate() + daysToNextSunday)
    } else {
      // If Epiphany is Sunday, Baptism of the Lord is the next Sunday
      baptismOfLord.setDate(epiphany.getDate() + 7)
    }
    return baptismOfLord
  }
}
