import { isSameDay } from "date-fns"

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

    // Default season
    let season = {
      name: "Ordinary Time",
      color: "green",
      description:
        "Ordinary Time is the period in the liturgical year outside of the distinct seasons (Advent, Christmas, Lent, and Easter). During Ordinary Time, the Church celebrates the mystery of Christ in all its aspects.",
      rank: "Season",
    }

    // Calculate Easter for the given year
    const easter = calculateEaster(date.getFullYear())

    // Calculate Ash Wednesday (46 days before Easter)
    const ashWednesday = new Date(easter)
    ashWednesday.setDate(easter.getDate() - 46)

    // Calculate Pentecost (50 days after Easter)
    const pentecost = new Date(easter)
    pentecost.setDate(easter.getDate() + 49)

    // Calculate Trinity Sunday (1 week after Pentecost)
    const trinitySunday = new Date(pentecost)
    trinitySunday.setDate(pentecost.getDate() + 7)

    // Calculate First Sunday of Advent (4th Sunday before Christmas)
    const christmas = new Date(date.getFullYear(), 11, 25)
    const christmasDay = christmas.getDay()
    const daysToSubtract = christmasDay + 21 // 3 weeks + days until Sunday
    const firstAdventSunday = calculateFirstAdventSunday(date)

    // Calculate Epiphany (Sunday closest to January 6)
    const epiphany = getEpiphanySunday(date.getFullYear())

    // Calculate Baptism of the Lord using the proper rules
    const baptismOfLord = getBaptismOfLordSunday(date.getFullYear())

    // Calculate for previous year (for dates in January)
    // Instead of recursive calls, we'll calculate directly
    let prevYearChristmas = null
    let prevYearFirstAdventSunday = null

    if (date.getMonth() === 0) {
      // January
      prevYearChristmas = new Date(date.getFullYear() - 1, 11, 25)
      const prevYearChristmasDay = prevYearChristmas.getDay()
      const prevYearDaysToSubtract = prevYearChristmasDay + 21
      prevYearFirstAdventSunday = new Date(prevYearChristmas)
      prevYearFirstAdventSunday.setDate(prevYearChristmas.getDate() - prevYearDaysToSubtract)
    }

    // Now determine the liturgical season

    // Advent
    if (date >= firstAdventSunday && date < christmas) {
      season = {
        name: "Advent",
        color: "Purple",
        description: "A season of preparation for the celebration of the birth of Jesus Christ",
        rank: "Season",
      }
      return season
    }

    // Christmas season (from Christmas Day until the day before Epiphany)
    const christmasSeasonEnd = new Date(epiphany)
    christmasSeasonEnd.setDate(epiphany.getDate() - 1) // Day before Epiphany

    if (date >= christmas && date <= christmasSeasonEnd) {
      season = {
        name: "Christmas",
        color: "White",
        description: "The celebration of the birth of Jesus Christ",
        rank: "Season",
      }
      return season
    }

    // Check if we're still in Christmas from previous year (for January dates)
    if (date.getMonth() === 0 && date < epiphany) {
      season = {
        name: "Christmas",
        color: "White",
        description: "The celebration of the birth of Jesus Christ",
        rank: "Season",
      }
      return season
    }

    // Epiphany (January 6 or the Sunday closest to it)
    if (date.getTime() === epiphany.getTime()) {
      season = {
        name: "Epiphany",
        color: "White",
        description: "The manifestation of Christ to the Gentiles",
        rank: "Solemnity",
      }
      return season
    }

    // Baptism of the Lord (Sunday after Epiphany)
    if (date.getTime() === baptismOfLord.getTime()) {
      season = {
        name: "Baptism of the Lord",
        color: "White",
        description: "The baptism of Jesus in the Jordan River",
        rank: "Feast",
      }
      return season
    }

    // Lent
    if (date >= ashWednesday && date < easter) {
      season = {
        name: "Lent",
        color: "Purple",
        description: "A season of penance, reflection, and fasting in preparation for Easter",
        rank: "Season",
      }
      return season
    }

    // Easter
    if (date >= easter && date < pentecost) {
      season = {
        name: "Easter",
        color: "White",
        description: "The celebration of the resurrection of Jesus Christ",
        rank: "Season",
      }
      return season
    }

    // Calculate start of first Ordinary Time period
    // Always start the Day after Baptism of the Lord
    const firstOrdinaryTimeStart = new Date(baptismOfLord)
    firstOrdinaryTimeStart.setDate(baptismOfLord.getDate() + 1) // Day after Baptism of the Lord

    // Ordinary Time (after Epiphany)
    if (date >= firstOrdinaryTimeStart && date < ashWednesday) {
      season = {
        name: "Ordinary Time",
        color: "Green",
        description: "The ordered life of the Church",
        rank: "Season",
      }
      return season
    }

    // Calculate start of second Ordinary Time period (Monday after Pentecost)
    const secondOrdinaryTimeStart = new Date(pentecost)
    secondOrdinaryTimeStart.setDate(pentecost.getDate() + 1) // Monday after Pentecost

    // Calculate end of second Ordinary Time period (Saturday before Advent)
    const secondOrdinaryTimeEnd = new Date(firstAdventSunday)
    secondOrdinaryTimeEnd.setDate(firstAdventSunday.getDate() - 1) // Saturday before Advent

    // Ordinary Time (after Pentecost)
    if (date >= secondOrdinaryTimeStart && date <= secondOrdinaryTimeEnd) {
      season = {
        name: "Ordinary Time",
        color: "Green",
        description: "The ordered life of the Church",
        rank: "Season",
      }
      return season
    }

    // Check if we're in Advent from previous year
    if (prevYearFirstAdventSunday && date >= prevYearFirstAdventSunday && date.getMonth() === 0) {
      season = {
        name: "Advent",
        color: "Purple",
        description: "A season of preparation for the celebration of the birth of Jesus Christ",
        rank: "Season",
      }
      return season
    }

    return season
  } catch (error) {
    console.error("Error in getLiturgicalSeason:", error)
    // Return a default season on error
    return {
      name: "Ordinary Time",
      color: "green",
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

  // This is a simplified implementation
  const year = date.getFullYear()

  // Calculate Easter
  const easter = calculateEaster(year)

  // Calculate Ash Wednesday (46 days before Easter)
  const ashWednesday = new Date(easter)
  ashWednesday.setDate(easter.getDate() - 46)

  // Calculate First Sunday of Advent (4th Sunday before Christmas)
  const christmas = new Date(year, 11, 25)
  const christmasDay = christmas.getDay()
  const daysToSubtract = christmasDay + 21 // 3 weeks + days until Sunday
  const firstAdventSunday = new Date(christmas)
  firstAdventSunday.setDate(christmas.getDate() - daysToSubtract)

  if (season.name === "Advent") {
    // Calculate which Sunday of Advent
    const daysSinceFirstSunday = Math.floor((date.getTime() - firstAdventSunday.getTime()) / (1000 * 60 * 60 * 24))
    const weekOfAdvent = Math.floor(daysSinceFirstSunday / 7) + 1
    return `Week ${weekOfAdvent} of Advent`
  }

  if (season.name === "Lent") {
    // Calculate which Sunday of Lent
    const daysSinceAshWednesday = Math.floor((date.getTime() - ashWednesday.getTime()) / (1000 * 60 * 60 * 24))
    const weekOfLent = Math.floor(daysSinceAshWednesday / 7) + 1
    return `Week ${weekOfLent} of Lent`
  }

  if (season.name === "Easter") {
    // Calculate which Sunday of Easter
    const daysSinceEaster = Math.floor((date.getTime() - easter.getTime()) / (1000 * 60 * 60 * 24))
    const weekOfEaster = Math.floor(daysSinceEaster / 7) + 1
    return `Week ${weekOfEaster} of Easter`
  }

  if (season.name === "Ordinary Time") {
    // Calculate Epiphany and Baptism of the Lord for proper week numbering
    const epiphany = getEpiphanySunday(year)
    const baptismOfLord = getBaptismOfLordSunday(year)

    // Calculate start of first Ordinary Time period (Monday after Baptism of the Lord)
    const firstOrdinaryTimeStart = new Date(baptismOfLord)
    firstOrdinaryTimeStart.setDate(baptismOfLord.getDate() + 1)

    // Calculate start of second Ordinary Time period (Monday after Pentecost)
    const pentecost = new Date(easter)
    pentecost.setDate(easter.getDate() + 49)
    const secondOrdinaryTimeStart = new Date(pentecost)
    secondOrdinaryTimeStart.setDate(pentecost.getDate() + 1)

    if (date < ashWednesday) {
      // First period of Ordinary Time (after Epiphany)
      // Calculate which liturgical week this date falls into
      // Week 1: Monday after Baptism through the following Sunday
      // Week 2: Next Monday through the following Sunday, etc.
      
      // Find the Monday of the week that contains this date
      const mondayOfWeek = new Date(date)
      const daysToMonday = date.getDay() === 0 ? 6 : date.getDay() - 1 // Sunday = 6 days back, others = day-1
      mondayOfWeek.setDate(date.getDate() - daysToMonday)
      
      // Calculate which week this Monday represents
      // If Baptism of the Lord is on a Monday, we need to adjust the calculation
      let referenceMonday = firstOrdinaryTimeStart
      if (baptismOfLord.getDay() === 1) { // Baptism is on Monday
        // The first liturgical week starts from the Monday of the week containing firstOrdinaryTimeStart
        const daysToRefMonday = firstOrdinaryTimeStart.getDay() === 0 ? 6 : firstOrdinaryTimeStart.getDay() - 1
        referenceMonday = new Date(firstOrdinaryTimeStart)
        referenceMonday.setDate(firstOrdinaryTimeStart.getDate() - daysToRefMonday)
      }
      
      const daysSinceFirstMonday = Math.floor((mondayOfWeek.getTime() - referenceMonday.getTime()) / (1000 * 60 * 60 * 24))
      const weekNumber = Math.floor(daysSinceFirstMonday / 7) + 1
      
      // For Sundays, adjust the numbering because Baptism of the Lord takes the place of the first Sunday
      if (date.getDay() === 0) { // Sunday
        return `Week ${weekNumber + 1} in Ordinary Time`
      } else {
        return `Week ${weekNumber} in Ordinary Time`
      }
    } else {
      // Second period of Ordinary Time (after Pentecost)
      const daysSinceStart = Math.floor((date.getTime() - secondOrdinaryTimeStart.getTime()) / (1000 * 60 * 60 * 24))
      const weekNumber = Math.floor(daysSinceStart / 7) + 1
      
      // Calculate total weeks in first period to continue numbering
      const daysInFirstPeriod = Math.floor((ashWednesday.getTime() - firstOrdinaryTimeStart.getTime()) / (1000 * 60 * 60 * 24))
      const weeksInFirstPeriod = Math.floor(daysInFirstPeriod / 7)
      
      return `Week ${weeksInFirstPeriod + weekNumber} in Ordinary Time`
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

// Calculate the date of Easter for a given year using the Meeus/Jones/Butcher algorithm
export function calculateEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1

  return new Date(year, month - 1, day) // JavaScript months are 0-indexed
}

export function calculateFirstAdventSunday(date: Date): Date {
  // Calculate First Sunday of Advent (4th Sunday before Christmas)
  const christmas = new Date(date.getFullYear(), 11, 25)
  const christmasDay = christmas.getDay()
  const daysToSubtract = christmasDay + 21 // 3 weeks + days until Sunday
  const firstAdventSunday = new Date(christmas)
  firstAdventSunday.setDate(christmas.getDate() - daysToSubtract)
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
  // Last Sunday before Advent (34th Sunday in Ordinary Time)
  const firstAdvent = calculateFirstAdventSunday(new Date(year, 11, 25))
  const christTheKing = new Date(firstAdvent)
  christTheKing.setDate(firstAdvent.getDate() - 7) // Sunday before Advent
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
