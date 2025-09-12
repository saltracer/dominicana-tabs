import { getBaptismOfLordSunday, getEpiphanySunday } from '../../assets/data/calendar/liturgical-seasons'

/**
 * Test data for Epiphany dates
 * Based on actual liturgical calendar data
 */
const EPIPHANY_TEST_DATA = [
  { year: 2010, expectedDate: new Date(2010, 0, 3), description: '2010 - Epiphany on Jan 3 (Sunday)' },
  { year: 2011, expectedDate: new Date(2011, 0, 2), description: '2011 - Epiphany on Jan 2 (Sunday) - Jan 6 is Thursday' },
  { year: 2012, expectedDate: new Date(2012, 0, 8), description: '2012 - Epiphany on Jan 8 (Sunday)' },
  { year: 2013, expectedDate: new Date(2013, 0, 6), description: '2013 - Epiphany on Jan 6 (Sunday)' },
  { year: 2024, expectedDate: new Date(2024, 0, 7), description: '2024 - Epiphany on Jan 7 (Sunday)' },
  { year: 2025, expectedDate: new Date(2025, 0, 5), description: '2025 - Epiphany on Jan 5 (Sunday)' },
  { year: 2026, expectedDate: new Date(2026, 0, 4), description: '2026 - Epiphany on Jan 4 (Sunday)' },
  { year: 2027, expectedDate: new Date(2027, 0, 3), description: '2027 - Epiphany on Jan 3 (Sunday)' },
]
/*
=== Testing Epiphany and Baptism Calculations ===
2010: Epiphany Sun Jan 03 2010 → Baptism Sun Jan 10 2010
2011: Epiphany Sun Jan 02 2011 → Baptism Sun Jan 09 2011
2012: Epiphany Sun Jan 08 2012 → Baptism Mon Jan 09 2012
2013: Epiphany Sun Jan 06 2013 → Baptism Sun Jan 13 2013
2024: Epiphany Sun Jan 07 2024 → Baptism Mon Jan 08 2024
2025: Epiphany Sun Jan 05 2025 → Baptism Sun Jan 12 2025
2026: Epiphany Sun Jan 04 2026 → Baptism Sun Jan 11 2026
2027: Epiphany Sun Jan 03 2027 → Baptism Sun Jan 10 2027
*/
/**
 * Test data for Baptism of the Lord dates
 * Based on actual liturgical calendar data
 */
const BAPTISM_OF_LORD_TEST_DATA = [
  // Verified dates provided by user
  { year: 2024, expectedDate: new Date(2024, 0, 8), description: '2024 - Epiphany on Jan 7, Baptism on Jan 8 (Monday)' },
  { year: 2025, expectedDate: new Date(2025, 0, 12), description: '2025 - Epiphany on Jan 5, Baptism on Jan 12 (Sunday)' },
  { year: 2026, expectedDate: new Date(2026, 0, 11), description: '2026 - Epiphany on Jan 4, Baptism on Jan 11 (Sunday)' },
  { year: 2027, expectedDate: new Date(2027, 0, 10), description: '2027 - Epiphany on Jan 3, Baptism on Jan 10 (Sunday)' },
  
  // Additional calculated dates for comprehensive testing (based on actual implementation)
  { year: 2010, expectedDate: new Date(2010, 0, 10), description: '2010 - Epiphany on Jan 3, Baptism on Jan 10 (Sunday)' },
  { year: 2011, expectedDate: new Date(2011, 0, 9), description: '2011 - Epiphany on Jan 2, Baptism on Jan 9 (Sunday)' },
  { year: 2012, expectedDate: new Date(2012, 0, 9), description: '2012 - Epiphany on Jan 8, Baptism on Jan 9 (Monday)' },
  { year: 2013, expectedDate: new Date(2013, 0, 13), description: '2013 - Epiphany on Jan 6, Baptism on Jan 13 (Sunday)' },
  { year: 2014, expectedDate: new Date(2014, 0, 12), description: '2014 - Epiphany on Jan 5, Baptism on Jan 12 (Sunday)' },
  { year: 2015, expectedDate: new Date(2015, 0, 11), description: '2015 - Epiphany on Jan 4, Baptism on Jan 11 (Sunday)' },
  { year: 2016, expectedDate: new Date(2016, 0, 10), description: '2016 - Epiphany on Jan 3, Baptism on Jan 10 (Sunday)' },
  { year: 2017, expectedDate: new Date(2017, 0, 9), description: '2017 - Epiphany on Jan 8, Baptism on Jan 9 (Monday)' },
  { year: 2018, expectedDate: new Date(2018, 0, 8), description: '2018 - Epiphany on Jan 7, Baptism on Jan 8 (Monday)' },
  { year: 2019, expectedDate: new Date(2019, 0, 13), description: '2019 - Epiphany on Jan 6, Baptism on Jan 13 (Sunday)' },
  { year: 2020, expectedDate: new Date(2020, 0, 12), description: '2020 - Epiphany on Jan 5, Baptism on Jan 12 (Sunday)' },
  { year: 2021, expectedDate: new Date(2021, 0, 10), description: '2021 - Epiphany on Jan 3, Baptism on Jan 10 (Sunday)' },
  { year: 2022, expectedDate: new Date(2022, 0, 9), description: '2022 - Epiphany on Jan 2, Baptism on Jan 9 (Sunday)' },
  { year: 2023, expectedDate: new Date(2023, 0, 9), description: '2023 - Epiphany on Jan 8, Baptism on Jan 9 (Monday)' },
  { year: 2028, expectedDate: new Date(2028, 0, 9), description: '2028 - Epiphany on Jan 2, Baptism on Jan 9 (Sunday)' },
  { year: 2029, expectedDate: new Date(2029, 0, 8), description: '2029 - Epiphany on Jan 7, Baptism on Jan 8 (Monday)' },
  { year: 2030, expectedDate: new Date(2030, 0, 13), description: '2030 - Epiphany on Jan 6, Baptism on Jan 13 (Sunday)' },
]

/**
 * Helper function to format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

/**
 * Helper function to check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

describe('Epiphany Date Calculations', () => {
  describe('getEpiphanySunday', () => {
    EPIPHANY_TEST_DATA.forEach(({ year, expectedDate, description }) => {
      test(`should return correct date for ${year}`, () => {
        const calculatedDate = getEpiphanySunday(year)
        
        expect(isSameDay(calculatedDate, expectedDate)).toBe(true)
        expect(calculatedDate.getFullYear()).toBe(year)
        
        // Log the result for verification
        console.log(`${description}: ${formatDate(calculatedDate)}`)
      })
    })
  })

  describe('Epiphany validation rules', () => {
    test('should always return a date in January', () => {
      for (let year = 2010; year <= 2030; year++) {
        const epiphanyDate = getEpiphanySunday(year)
        expect(epiphanyDate.getMonth()).toBe(0) // January = 0
        expect(epiphanyDate.getFullYear()).toBe(year)
      }
    })

    test('should return Epiphany date between January 2 and January 9', () => {
      for (let year = 2010; year <= 2030; year++) {
        const epiphanyDate = getEpiphanySunday(year)
        const day = epiphanyDate.getDate()
        expect(day).toBeGreaterThanOrEqual(2)
        expect(day).toBeLessThanOrEqual(9)
      }
    })

    test('should always return a Sunday', () => {
      for (let year = 2010; year <= 2030; year++) {
        const epiphanyDate = getEpiphanySunday(year)
        expect(epiphanyDate.getDay()).toBe(0) // Sunday = 0
      }
    })

    test('should return the Sunday between January 2 and January 8', () => {
      for (let year = 2010; year <= 2030; year++) {
        const epiphanyDate = getEpiphanySunday(year)
        const epiphanyDay = epiphanyDate.getDate()
        
        // Epiphany should be between January 2 and January 8 (inclusive)
        expect(epiphanyDay).toBeGreaterThanOrEqual(2)
        expect(epiphanyDay).toBeLessThanOrEqual(8)
      }
    })
  })

  describe('Comprehensive Epiphany test for all years 2010-2030', () => {
    test('should calculate correct Epiphany dates for all years', () => {
      const results: Array<{
        year: number
        epiphany: string
        epiphanyDay: number
        jan6Day: number
        dayDifference: number
      }> = []

      for (let year = 2010; year <= 2030; year++) {
        const epiphany = getEpiphanySunday(year)
        const jan6 = new Date(year, 0, 6)
        const dayDifference = Math.abs(epiphany.getDate() - jan6.getDate())
        
        results.push({
          year,
          epiphany: epiphany.toDateString(),
          epiphanyDay: epiphany.getDay(),
          jan6Day: jan6.getDay(),
          dayDifference
        })
      }

      // Log all results for verification
      console.log('\n=== Complete Epiphany Test Results 2010-2030 ===')
      console.log('Year | Epiphany Date | Epiphany Day | Jan 6 Day | Day Difference')
      console.log('-----|---------------|--------------|-----------|---------------')
      
      results.forEach(result => {
        console.log(`${result.year} | ${result.epiphany} | ${result.epiphanyDay} | ${result.jan6Day} | ${result.dayDifference}`)
      })

      // Verify all calculations are correct
      results.forEach(result => {
        expect(result.epiphanyDay).toBe(0) // Always Sunday
        const epiphanyDate = getEpiphanySunday(result.year)
        expect(epiphanyDate.getDate()).toBeGreaterThanOrEqual(2) // Between Jan 2-8
        expect(epiphanyDate.getDate()).toBeLessThanOrEqual(8) // Between Jan 2-8
      })
    })
  })
})

describe('Baptism of the Lord Date Calculations', () => {
  describe('getBaptismOfLordSunday', () => {
    BAPTISM_OF_LORD_TEST_DATA.forEach(({ year, expectedDate, description }) => {
      test(`should return correct date for ${year}`, () => {
        const calculatedDate = getBaptismOfLordSunday(year)
        
        expect(isSameDay(calculatedDate, expectedDate)).toBe(true)
        expect(calculatedDate.getFullYear()).toBe(year)
        
        // Log the result for verification
        console.log(`${description}: ${formatDate(calculatedDate)}`)
      })
    })
  })

  describe('Special cases for Epiphany on January 7 or 8', () => {
    const specialCases = [
      { year: 2012, epiphanyDate: new Date(2012, 0, 8), baptismDate: new Date(2012, 0, 9) },
      { year: 2017, epiphanyDate: new Date(2017, 0, 8), baptismDate: new Date(2017, 0, 9) },
      { year: 2018, epiphanyDate: new Date(2018, 0, 7), baptismDate: new Date(2018, 0, 8) },
      { year: 2023, epiphanyDate: new Date(2023, 0, 8), baptismDate: new Date(2023, 0, 9) },
      { year: 2024, epiphanyDate: new Date(2024, 0, 7), baptismDate: new Date(2024, 0, 8) },
      { year: 2029, epiphanyDate: new Date(2029, 0, 7), baptismDate: new Date(2029, 0, 8) },
    ]

    specialCases.forEach(({ year, epiphanyDate, baptismDate }) => {
      test(`should handle special case for ${year} (Epiphany on Jan ${epiphanyDate.getDate()})`, () => {
        const calculatedEpiphany = getEpiphanySunday(year)
        const calculatedBaptism = getBaptismOfLordSunday(year)
        
        expect(isSameDay(calculatedEpiphany, epiphanyDate)).toBe(true)
        expect(isSameDay(calculatedBaptism, baptismDate)).toBe(true)
        
        // Verify that Baptism is on Monday when Epiphany is on Jan 7 or 8
        expect(calculatedBaptism.getDay()).toBe(1) // Monday = 1
        
        console.log(`${year}: Epiphany ${formatDate(calculatedEpiphany)} → Baptism ${formatDate(calculatedBaptism)} (Monday)`)
      })
    })
  })

  describe('Normal cases (Baptism on Sunday)', () => {
    const normalCases = [
      { year: 2010, epiphanyDate: new Date(2010, 0, 3), baptismDate: new Date(2010, 0, 10) },
      { year: 2011, epiphanyDate: new Date(2011, 0, 2), baptismDate: new Date(2011, 0, 9) },
      { year: 2013, epiphanyDate: new Date(2013, 0, 6), baptismDate: new Date(2013, 0, 13) },
      { year: 2014, epiphanyDate: new Date(2014, 0, 5), baptismDate: new Date(2014, 0, 12) },
      { year: 2015, epiphanyDate: new Date(2015, 0, 4), baptismDate: new Date(2015, 0, 11) },
      { year: 2016, epiphanyDate: new Date(2016, 0, 3), baptismDate: new Date(2016, 0, 10) },
      { year: 2019, epiphanyDate: new Date(2019, 0, 6), baptismDate: new Date(2019, 0, 13) },
      { year: 2020, epiphanyDate: new Date(2020, 0, 5), baptismDate: new Date(2020, 0, 12) },
      { year: 2021, epiphanyDate: new Date(2021, 0, 3), baptismDate: new Date(2021, 0, 10) },
      { year: 2022, epiphanyDate: new Date(2022, 0, 2), baptismDate: new Date(2022, 0, 9) },
      { year: 2025, epiphanyDate: new Date(2025, 0, 5), baptismDate: new Date(2025, 0, 12) },
      { year: 2026, epiphanyDate: new Date(2026, 0, 4), baptismDate: new Date(2026, 0, 11) },
      { year: 2027, epiphanyDate: new Date(2027, 0, 3), baptismDate: new Date(2027, 0, 10) },
      { year: 2028, epiphanyDate: new Date(2028, 0, 2), baptismDate: new Date(2028, 0, 9) },
      { year: 2030, epiphanyDate: new Date(2030, 0, 6), baptismDate: new Date(2030, 0, 13) },
    ]

    normalCases.forEach(({ year, epiphanyDate, baptismDate }) => {
      test(`should handle normal case for ${year} (Baptism on Sunday)`, () => {
        const calculatedEpiphany = getEpiphanySunday(year)
        const calculatedBaptism = getBaptismOfLordSunday(year)
        
        expect(isSameDay(calculatedEpiphany, epiphanyDate)).toBe(true)
        expect(isSameDay(calculatedBaptism, baptismDate)).toBe(true)
        
        // Verify that Baptism is on Sunday for normal cases
        expect(calculatedBaptism.getDay()).toBe(0) // Sunday = 0
        
        console.log(`${year}: Epiphany ${formatDate(calculatedEpiphany)} → Baptism ${formatDate(calculatedBaptism)} (Sunday)`)
      })
    })
  })

  describe('Edge cases and validation', () => {
    test('should always return a date in January', () => {
      for (let year = 2010; year <= 2030; year++) {
        const baptismDate = getBaptismOfLordSunday(year)
        expect(baptismDate.getMonth()).toBe(0) // January = 0
        expect(baptismDate.getFullYear()).toBe(year)
      }
    })

    test('should return Baptism date between January 8 and January 16', () => {
      for (let year = 2010; year <= 2030; year++) {
        const baptismDate = getBaptismOfLordSunday(year)
        const day = baptismDate.getDate()
        expect(day).toBeGreaterThanOrEqual(8)
        expect(day).toBeLessThanOrEqual(16)
      }
    })

    test('should return Monday when Epiphany is on January 7 or 8', () => {
      for (let year = 2010; year <= 2030; year++) {
        const epiphany = getEpiphanySunday(year)
        const baptism = getBaptismOfLordSunday(year)
        
        if (epiphany.getDate() === 7 || epiphany.getDate() === 8) {
          expect(baptism.getDay()).toBe(1) // Monday
        }
      }
    })

    test('should return Sunday when Epiphany is NOT on January 7 or 8', () => {
      for (let year = 2010; year <= 2030; year++) {
        const epiphany = getEpiphanySunday(year)
        const baptism = getBaptismOfLordSunday(year)
        
        if (epiphany.getDate() !== 7 && epiphany.getDate() !== 8) {
          expect(baptism.getDay()).toBe(0) // Sunday
        }
      }
    })
  })

  describe('Comprehensive date range test', () => {
    test('should calculate correct dates for all years 2010-2030', () => {
      const results: Array<{
        year: number
        epiphany: string
        baptism: string
        epiphanyDay: number
        baptismDay: number
        isSpecialCase: boolean
      }> = []

      for (let year = 2010; year <= 2030; year++) {
        const epiphany = getEpiphanySunday(year)
        const baptism = getBaptismOfLordSunday(year)
        
        const isSpecialCase = epiphany.getDate() === 7 || epiphany.getDate() === 8
        
        results.push({
          year,
          epiphany: epiphany.toDateString(),
          baptism: baptism.toDateString(),
          epiphanyDay: epiphany.getDay(),
          baptismDay: baptism.getDay(),
          isSpecialCase
        })
      }

      // Log all results for verification
      console.log('\n=== Complete Test Results 2010-2030 ===')
      console.log('Year | Epiphany Date | Baptism Date | Epiphany Day | Baptism Day | Special Case')
      console.log('-----|---------------|--------------|--------------|-------------|-------------')
      
      results.forEach(result => {
        const specialCaseMarker = result.isSpecialCase ? 'YES' : 'NO'
        console.log(`${result.year} | ${result.epiphany} | ${result.baptism} | ${result.epiphanyDay} | ${result.baptismDay} | ${specialCaseMarker}`)
      })

      // Verify all calculations are correct
      results.forEach(result => {
        if (result.isSpecialCase) {
          expect(result.baptismDay).toBe(1) // Monday
        } else {
          expect(result.baptismDay).toBe(0) // Sunday
        }
      })
    })
  })
})
