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
    expectedSeason: "Christmas",
    expectedWeek: "Christmas",
    description: "January 12, 2025 - Baptism of the Lord (last day of Christmas season)"
  },
  {
    date: new Date(2025, 0, 13), // January 13, 2025
    expectedSeason: "Ordinary Time",
    expectedWeek: "Week 1 in Ordinary Time",
    description: "January 13, 2025 - Monday, Week 1 of Ordinary Time"
  },
  {
    date: new Date(2025, 3, 20), // April 20, 2025
    expectedSeason: "Octave of Easter",
    expectedWeek: "Octave of Easter",
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
    expectedWeek: "Week 10 in Ordinary Time",
    description: "June 9, 2025 - Monday, Week 10 of Ordinary Time (first day of second period)"
  },
  {
    date: new Date(2025, 10, 30), // November 30, 2025
    expectedSeason: "Advent",
    expectedWeek: "Week 1 of Advent",
    description: "November 30, 2025 - First Sunday of Advent"
  },
  {
    date: new Date(2025, 11, 25), // December 25, 2025
    expectedSeason: "Octave of Christmas",
    expectedWeek: "Octave of Christmas",
    description: "December 25, 2025 - Christmas Day"
  },

  // 2024 Test Cases
  {
    date: new Date(2024, 0, 8), // January 8, 2024
    expectedSeason: "Christmas",
    expectedWeek: "Christmas",
    description: "January 8, 2024 - Baptism of the Lord (last day of Christmas season)"
  },
  {
    date: new Date(2024, 0, 9), // January 9, 2024
    expectedSeason: "Ordinary Time",
    expectedWeek: "Week 1 in Ordinary Time",
    description: "January 9, 2024 - Tuesday, Week 1 of Ordinary Time"
  },
  {
    date: new Date(2024, 0, 14), // January 14, 2024
    expectedSeason: "Ordinary Time",
    expectedWeek: "Week 2 in Ordinary Time",
    description: "January 14, 2024 - Sunday, Week 2 of Ordinary Time"
  },
  {
    date: new Date(2025, 0, 10), // January 10, 2025
    expectedSeason: "Christmas",
    expectedWeek: "Christmas",
    description: "January 10, 2025 - Friday after Epiphany (Christmas season)"
  },
  {
    date: new Date(2024, 2, 31), // March 31, 2024
    expectedSeason: "Octave of Easter",
    expectedWeek: "Octave of Easter",
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
    expectedSeason: "Holy Week",
    expectedWeek: "Holy Week",
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
        expect(['Advent', 'Octave of Christmas', 'Christmas', 'Ordinary Time', 'Lent', 'Octave of Easter', 'Easter', 'Epiphany', "Holy Week"]).toContain(season.name);
      });
    });

    test('should always return a valid week string', () => {
      const testDates = [
        //new Date(2025, 0, 2),
        new Date(2025, 1, 8),
        new Date(2025, 2, 17),
        new Date(2025, 5, 15),
        new Date(2025, 9, 31),
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
      const firstWeekSecondPeriod = new Date(2026, 4, 26); // May 26, 2026 - should be Week 8
      
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
      expect(weekNumber2).toBe(weekNumber1 + 2); //2026 is an odd year, so we expect 2 weeks difference
    });

    test('should have continuous week numbering between first and second periods in 2025', () => {
      // Test the transition from first period to second period
      const lastWeekFirstPeriod = new Date(2025, 2, 4); // March 4, 2025 - should be Week 8
      const firstWeekSecondPeriod = new Date(2025, 5, 9); // June 9, 2025 - should be Week 10
      
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
      expect(weekNumber2).toBe(weekNumber1 + 2);
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
        const firstWeekSecondPeriod = new Date(2023, 4, 30); // May 30, 2023 - should be Week 8
        
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
          expectedSeason: "Christmas",
          description: "Baptism of the Lord day (last day of Christmas season)"
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
          expectedSeason: "Holy Week",
          description: "Day before Easter"
        },
        {
          date: new Date(2025, 3, 20), // Easter Sunday
          expectedSeason: "Octave of Easter",
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

  describe('Christ the King and End of Liturgical Year', () => {
    test('should return correct season and week for Christ the King 2023', () => {
      const date = new Date(2023, 10, 26); // November 26, 2023 - Sunday
      const season = getLiturgicalSeason(date);
      const week = getLiturgicalWeek(date, season);

      console.log(`Testing: November 26, 2023 - Christ the King`);
      console.log(`Date: ${formatDate(date)}`);
      console.log(`Expected Season: Christ the King, Got: ${season.name}`);
      console.log(`Expected Week: Week in Christ the King, Got: ${week}`);
      console.log(`---`);

      expect(season.name).toBe('Christ the King');
      expect(week).toBe('Week in Christ the King');
    });

    test('should return correct season and week for Christ the King 2024', () => {
      const date = new Date(2024, 10, 24); // November 24, 2024 - Sunday
      const season = getLiturgicalSeason(date);
      const week = getLiturgicalWeek(date, season);

      console.log(`Testing: November 24, 2024 - Christ the King`);
      console.log(`Date: ${formatDate(date)}`);
      console.log(`Expected Season: Christ the King, Got: ${season.name}`);
      console.log(`Expected Week: Week in Christ the King, Got: ${week}`);
      console.log(`---`);

      expect(season.name).toBe('Christ the King');
      expect(week).toBe('Week in Christ the King');
    });

    test('should return correct season and week for Christ the King 2025', () => {
      const date = new Date(2025, 10, 23); // November 23, 2025 - Sunday
      const season = getLiturgicalSeason(date);
      const week = getLiturgicalWeek(date, season);

      console.log(`Testing: November 23, 2025 - Christ the King`);
      console.log(`Date: ${formatDate(date)}`);
      console.log(`Expected Season: Christ the King, Got: ${season.name}`);
      console.log(`Expected Week: Week in Christ the King, Got: ${week}`);
      console.log(`---`);

      expect(season.name).toBe('Christ the King');
      expect(week).toBe('Week in Christ the King');
    });

    test('should return correct season and week for Christ the King 2026', () => {
      const date = new Date(2026, 10, 22); // November 22, 2026 - Sunday
      const season = getLiturgicalSeason(date);
      const week = getLiturgicalWeek(date, season);

      console.log(`Testing: November 22, 2026 - Christ the King`);
      console.log(`Date: ${formatDate(date)}`);
      console.log(`Expected Season: Christ the King, Got: ${season.name}`);
      console.log(`Expected Week: Week in Christ the King, Got: ${week}`);
      console.log(`---`);

      expect(season.name).toBe('Christ the King');
      expect(week).toBe('Week in Christ the King');
    });

    test('should correctly identify end of liturgical year period', () => {
      // Test the period between Christ the King and First Sunday of Advent
      const christTheKing2025 = new Date(2025, 10, 23); // November 23, 2025
      const firstAdvent2025 = new Date(2025, 10, 30); // November 30, 2025
      
      const christKingSeason = getLiturgicalSeason(christTheKing2025);
      const adventSeason = getLiturgicalSeason(firstAdvent2025);

      console.log(`Testing: End of Liturgical Year Period`);
      console.log(`Christ the King (Nov 23, 2025): ${christKingSeason.name}`);
      console.log(`First Advent (Nov 30, 2025): ${adventSeason.name}`);
      console.log(`---`);

      expect(christKingSeason.name).toBe('Christ the King');
      expect(adventSeason.name).toBe('Advent');
    });
  });

  describe('First Sunday of Advent and New Liturgical Year', () => {
    test('should return correct season and week for First Sunday of Advent 2023', () => {
      const date = new Date(2023, 11, 3); // December 3, 2023 - Sunday
      const season = getLiturgicalSeason(date);
      const week = getLiturgicalWeek(date, season);

      console.log(`Testing: December 3, 2023 - First Sunday of Advent`);
      console.log(`Date: ${formatDate(date)}`);
      console.log(`Expected Season: Advent, Got: ${season.name}`);
      console.log(`Expected Week: Week 1 of Advent, Got: ${week}`);
      console.log(`---`);

      expect(season.name).toBe('Advent');
      expect(week).toBe('Week 1 of Advent');
    });

    test('should return correct season and week for First Sunday of Advent 2024', () => {
      const date = new Date(2024, 11, 1); // December 1, 2024 - Sunday
      const season = getLiturgicalSeason(date);
      const week = getLiturgicalWeek(date, season);

      console.log(`Testing: December 1, 2024 - First Sunday of Advent`);
      console.log(`Date: ${formatDate(date)}`);
      console.log(`Expected Season: Advent, Got: ${season.name}`);
      console.log(`Expected Week: Week 1 of Advent, Got: ${week}`);
      console.log(`---`);

      expect(season.name).toBe('Advent');
      expect(week).toBe('Week 1 of Advent');
    });

    test('should return correct season and week for First Sunday of Advent 2025', () => {
      const date = new Date(2025, 10, 30); // November 30, 2025 - Sunday
      const season = getLiturgicalSeason(date);
      const week = getLiturgicalWeek(date, season);

      console.log(`Testing: November 30, 2025 - First Sunday of Advent`);
      console.log(`Date: ${formatDate(date)}`);
      console.log(`Expected Season: Advent, Got: ${season.name}`);
      console.log(`Expected Week: Week 1 of Advent, Got: ${week}`);
      console.log(`---`);

      expect(season.name).toBe('Advent');
      expect(week).toBe('Week 1 of Advent');
    });

    test('should return correct season and week for First Sunday of Advent 2026', () => {
      const date = new Date(2026, 10, 29); // November 29, 2026 - Sunday
      const season = getLiturgicalSeason(date);
      const week = getLiturgicalWeek(date, season);

      console.log(`Testing: November 29, 2026 - First Sunday of Advent`);
      console.log(`Date: ${formatDate(date)}`);
      console.log(`Expected Season: Advent, Got: ${season.name}`);
      console.log(`Expected Week: Week 1 of Advent, Got: ${week}`);
      console.log(`---`);

      expect(season.name).toBe('Advent');
      expect(week).toBe('Week 1 of Advent');
    });

    test('should correctly identify new liturgical year start', () => {
      // Test the transition from Christ the King to First Sunday of Advent
      const christTheKing2025 = new Date(2025, 10, 23); // November 23, 2025
      const firstAdvent2025 = new Date(2025, 10, 30); // November 30, 2025
      
      const christKingSeason = getLiturgicalSeason(christTheKing2025);
      const adventSeason = getLiturgicalSeason(firstAdvent2025);

      console.log(`Testing: New Liturgical Year Start`);
      console.log(`Christ the King (Nov 23, 2025): ${christKingSeason.name}`);
      console.log(`First Advent (Nov 30, 2025): ${adventSeason.name}`);
      console.log(`---`);

      expect(christKingSeason.name).toBe('Christ the King');
      expect(adventSeason.name).toBe('Advent');
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
