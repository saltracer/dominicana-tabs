import { getLiturgicalSeason, getLiturgicalWeek } from '../../assets/data/calendar/liturgical-seasons';

// Test data structure for liturgical dates
interface LiturgicalDateTest {
  date: Date;
  expectedSeason: string;
  expectedWeek: string;
  description: string;
}

// Helper function to check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

// Helper function to format dates for display
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Test data for liturgical dates
const LITURGICAL_DATE_TESTS: LiturgicalDateTest[] = [
  // 2025 Test Cases
  {
    date: new Date(2025, 5, 10), // June 10, 2025
    expectedSeason: "Ordinary Time",
    expectedWeek: "Week 10 in Ordinary Time",
    description: "June 10, 2025 - Tuesday, Week 10 of Ordinary Time"
  },
  {
    date: new Date(2025, 5, 7), // June 7, 2025
    expectedSeason: "Easter",
    expectedWeek: "Week 7 of Easter",
    description: "June 7, 2025 - Saturday of Week 7 of Easter Season"
  },
  {
    date: new Date(2025, 2, 4), // March 4, 2025
    expectedSeason: "Ordinary Time",
    expectedWeek: "Week 8 in Ordinary Time",
    description: "March 4, 2025 - Tuesday of Week 8 of Ordinary Time"
  },
  {
    date: new Date(2025, 2, 9), // March 9, 2025
    expectedSeason: "Lent",
    expectedWeek: "Week 1 of Lent",
    description: "March 9, 2025 - First Sunday of Lent"
  },
  
  // Additional test cases for different seasons
  {
    date: new Date(2025, 0, 12), // January 12, 2025
    expectedSeason: "Baptism of the Lord",
    expectedWeek: "Week in Baptism of the Lord",
    description: "January 12, 2025 - Baptism of the Lord"
  },
  {
    date: new Date(2025, 0, 13), // January 13, 2025
    expectedSeason: "Ordinary Time",
    expectedWeek: "Week 1 in Ordinary Time",
    description: "January 13, 2025 - Monday, Week 1 of Ordinary Time"
  },
  {
    date: new Date(2025, 3, 20), // April 20, 2025
    expectedSeason: "Easter",
    expectedWeek: "Week 1 of Easter",
    description: "April 20, 2025 - Easter Sunday"
  },
  {
    date: new Date(2025, 5, 8), // June 8, 2025
    expectedSeason: "Easter",
    expectedWeek: "Week 8 of Easter",
    description: "June 8, 2025 - Pentecost Sunday"
  },
  {
    date: new Date(2025, 5, 9), // June 9, 2025
    expectedSeason: "Ordinary Time",
    expectedWeek: "Week 9 in Ordinary Time",
    description: "June 9, 2025 - Monday, Week 9 of Ordinary Time (first day of second period)"
  },
  {
    date: new Date(2025, 11, 28), // November 30, 2025
    expectedSeason: "Advent",
    expectedWeek: "Week 1 of Advent",
    description: "November 30, 2025 - First Sunday of Advent"
  },
  {
    date: new Date(2025, 11, 25), // December 25, 2025
    expectedSeason: "Christmas",
    expectedWeek: "Week in Christmas",
    description: "December 25, 2025 - Christmas Day"
  },

  // 2024 Test Cases
  {
    date: new Date(2024, 0, 8), // January 8, 2024
    expectedSeason: "Baptism of the Lord",
    expectedWeek: "Week in Baptism of the Lord",
    description: "January 8, 2024 - Baptism of the Lord (Monday)"
  },
  {
    date: new Date(2024, 0, 9), // January 9, 2024
    expectedSeason: "Ordinary Time",
    expectedWeek: "Week 1 in Ordinary Time",
    description: "January 9, 2024 - Tuesday, Week 1 of Ordinary Time"
  },
  {
    date: new Date(2024, 2, 31), // March 31, 2024
    expectedSeason: "Easter",
    expectedWeek: "Week 1 of Easter",
    description: "March 31, 2024 - Easter Sunday"
  },

  // Edge cases
  {
    date: new Date(2025, 2, 5), // March 5, 2025
    expectedSeason: "Lent",
    expectedWeek: "Week 1 of Lent",
    description: "March 5, 2025 - Ash Wednesday"
  },
  {
    date: new Date(2025, 3, 17), // April 17, 2025
    expectedSeason: "Easter",
    expectedWeek: "Week 4 of Easter",
    description: "April 17, 2025 - Thursday of Easter Week 4"
  }
];

describe('Liturgical Date Calculations', () => {
  describe('Season and Week Calculations', () => {
    LITURGICAL_DATE_TESTS.forEach(({ date, expectedSeason, expectedWeek, description }) => {
      test(`should return correct season and week for ${description}`, () => {
        const season = getLiturgicalSeason(date);
        const week = getLiturgicalWeek(date, season);
        
        console.log(`Testing: ${description}`);
        console.log(`Date: ${formatDate(date)}`);
        console.log(`Expected Season: ${expectedSeason}, Got: ${season.name}`);
        console.log(`Expected Week: ${expectedWeek}, Got: ${week}`);
        console.log('---');
        
        expect(season.name).toBe(expectedSeason);
        expect(week).toBe(expectedWeek);
      });
    });
  });

  describe('Season Validation Rules', () => {
    test('should always return a valid season name', () => {
      const testDates = [
        new Date(2025, 0, 1),   // New Year
        new Date(2025, 5, 15),  // Mid-year
        new Date(2025, 11, 31), // End of year
      ];

      testDates.forEach(date => {
        const season = getLiturgicalSeason(date);
        expect(season.name).toBeDefined();
        expect(season.name.length).toBeGreaterThan(0);
        expect(['Advent', 'Christmas', 'Ordinary Time', 'Lent', 'Easter', 'Epiphany', 'Baptism of the Lord']).toContain(season.name);
      });
    });

    test('should always return a valid week string', () => {
      const testDates = [
        new Date(2025, 0, 1),
        new Date(2025, 5, 15),
        new Date(2025, 11, 31),
      ];

      testDates.forEach(date => {
        const season = getLiturgicalSeason(date);
        const week = getLiturgicalWeek(date, season);
        
        expect(week).toBeDefined();
        expect(week.length).toBeGreaterThan(0);
        expect(week).toMatch(/Week \d+/);
      });
    });
  });

  describe('Ordinary Time Week Continuity', () => {
    test('should have continuous week numbering between first and second periods in 2026', () => {
      // Test the transition from first period to second period
      const lastWeekFirstPeriod = new Date(2026, 1, 17); // Feruary 17, 2026 - should be Week 6
      const firstWeekSecondPeriod = new Date(2026, 5, 9); // June 9, 2026 - should be Week 8?
      
      const season1 = getLiturgicalSeason(lastWeekFirstPeriod);
      const week1 = getLiturgicalWeek(lastWeekFirstPeriod, season1);
      
      const season2 = getLiturgicalSeason(firstWeekSecondPeriod);
      const week2 = getLiturgicalWeek(firstWeekSecondPeriod, season2);
      
      console.log(`Last week of first period: ${formatDate(lastWeekFirstPeriod)} - ${week1}`);
      console.log(`First week of second period: ${formatDate(firstWeekSecondPeriod)} - ${week2}`);
      
      // Extract week numbers
      const weekNumber1 = parseInt(week1.match(/\d+/)?.[0] || '0');
      const weekNumber2 = parseInt(week2.match(/\d+/)?.[0] || '0');
      
      // Second period should start where first period left off + 1
      expect(weekNumber2).toBe(weekNumber1 + 1);
    });

    test('should have continuous week numbering between first and second periods in 2025', () => {
      // Test the transition from first period to second period
      const lastWeekFirstPeriod = new Date(2025, 2, 4); // March 4, 2025 - should be Week 8
      const firstWeekSecondPeriod = new Date(2025, 5, 9); // June 9, 2025 - should be Week 9
      
      const season1 = getLiturgicalSeason(lastWeekFirstPeriod);
      const week1 = getLiturgicalWeek(lastWeekFirstPeriod, season1);
      
      const season2 = getLiturgicalSeason(firstWeekSecondPeriod);
      const week2 = getLiturgicalWeek(firstWeekSecondPeriod, season2);
      
      console.log(`Last week of first period: ${formatDate(lastWeekFirstPeriod)} - ${week1}`);
      console.log(`First week of second period: ${formatDate(firstWeekSecondPeriod)} - ${week2}`);
      
      // Extract week numbers
      const weekNumber1 = parseInt(week1.match(/\d+/)?.[0] || '0');
      const weekNumber2 = parseInt(week2.match(/\d+/)?.[0] || '0');
      
      // Second period should start where first period left off + 1
      expect(weekNumber2).toBe(weekNumber1 + 1);
    });

    test('should have continuous week numbering between first and second periods in 2024', () => {
        // Test the transition from first period to second period
        const lastWeekFirstPeriod = new Date(2024, 1, 13); // Feb 13, 2024 - should be Week 6
        const firstWeekSecondPeriod = new Date(2024, 4, 21); // May 21, 2024 - should be Week 7
        
        const season1 = getLiturgicalSeason(lastWeekFirstPeriod);
        const week1 = getLiturgicalWeek(lastWeekFirstPeriod, season1);
        
        const season2 = getLiturgicalSeason(firstWeekSecondPeriod);
        const week2 = getLiturgicalWeek(firstWeekSecondPeriod, season2);
        
        console.log(`Last week of first period: ${formatDate(lastWeekFirstPeriod)} - ${week1}`);
        console.log(`First week of second period: ${formatDate(firstWeekSecondPeriod)} - ${week2}`);
        
        // Extract week numbers
        const weekNumber1 = parseInt(week1.match(/\d+/)?.[0] || '0');
        const weekNumber2 = parseInt(week2.match(/\d+/)?.[0] || '0');
        
        // Second period should start where first period left off + 1
        expect(weekNumber2).toBe(weekNumber1 + 1);
      });

    test('should have continuous week numbering between first and second periods in 2023', () => {
        // Test the transition from first period to second period
        const lastWeekFirstPeriod = new Date(2023, 1, 21); // Feb 21, 2023 - should be Week 7
        const firstWeekSecondPeriod = new Date(2023, 4, 30); // May 21, 2023 - should be Week 8
        
        const season1 = getLiturgicalSeason(lastWeekFirstPeriod);
        const week1 = getLiturgicalWeek(lastWeekFirstPeriod, season1);
        
        const season2 = getLiturgicalSeason(firstWeekSecondPeriod);
        const week2 = getLiturgicalWeek(firstWeekSecondPeriod, season2);
        
        console.log(`Last week of first period: ${formatDate(lastWeekFirstPeriod)} - ${week1}`);
        console.log(`First week of second period: ${formatDate(firstWeekSecondPeriod)} - ${week2}`);
        
        // Extract week numbers
        const weekNumber1 = parseInt(week1.match(/\d+/)?.[0] || '0');
        const weekNumber2 = parseInt(week2.match(/\d+/)?.[0] || '0');
        
        // Second period should start where first period left off + 1
        expect(weekNumber2).toBe(weekNumber1 + 1);
    });
  });

  describe('Season Boundaries', () => {
    test('should correctly identify season boundaries', () => {
      // Test specific boundary dates
      const boundaries = [
        {
          date: new Date(2025, 0, 12), // Baptism of the Lord
          expectedSeason: "Baptism of the Lord",
          description: "Baptism of the Lord day"
        },
        {
          date: new Date(2025, 0, 13), // Day after Baptism
          expectedSeason: "Ordinary Time",
          description: "Day after Baptism of the Lord"
        },
        {
          date: new Date(2025, 2, 4), // Day before Ash Wednesday
          expectedSeason: "Ordinary Time",
          description: "Day before Ash Wednesday"
        },
        {
          date: new Date(2025, 2, 5), // Ash Wednesday
          expectedSeason: "Lent",
          description: "Ash Wednesday"
        },
        {
          date: new Date(2025, 3, 19), // Day before Easter
          expectedSeason: "Lent",
          description: "Day before Easter"
        },
        {
          date: new Date(2025, 3, 20), // Easter Sunday
          expectedSeason: "Easter",
          description: "Easter Sunday"
        },
        {
          date: new Date(2025, 5, 7), // Day before Pentecost
          expectedSeason: "Easter",
          description: "Day before Pentecost"
        },
        {
          date: new Date(2025, 5, 8), // Pentecost Sunday
          expectedSeason: "Easter",
          description: "Pentecost Sunday"
        },
        {
          date: new Date(2025, 5, 9), // Day after Pentecost
          expectedSeason: "Ordinary Time",
          description: "Day after Pentecost"
        }
      ];

      boundaries.forEach(({ date, expectedSeason, description }) => {
        const season = getLiturgicalSeason(date);
        console.log(`${formatDate(date)} (${description}): Expected ${expectedSeason}, Got ${season.name}`);
        expect(season.name).toBe(expectedSeason);
      });
    });
  });
});

// Helper function to add new test cases
export function addLiturgicalDateTest(
  year: number,
  month: number, // 0-indexed (0 = January)
  day: number,
  expectedSeason: string,
  expectedWeek: string,
  description: string
): void {
  LITURGICAL_DATE_TESTS.push({
    date: new Date(year, month, day),
    expectedSeason,
    expectedWeek,
    description
  });
}

// Helper function to run a quick test for a specific date
export function testLiturgicalDate(date: Date): { season: string; week: string } {
  const season = getLiturgicalSeason(date);
  const week = getLiturgicalWeek(date, season);
  
  console.log(`Date: ${formatDate(date)}`);
  console.log(`Season: ${season.name}`);
  console.log(`Week: ${week}`);
  
  return { season: season.name, week };
}
