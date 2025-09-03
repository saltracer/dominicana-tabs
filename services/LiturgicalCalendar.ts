import { LiturgicalDay, LiturgicalSeason, Celebration, Saint } from '../types';
import { format } from 'date-fns';
import { getCelebrationsForDate, getLiturgicalSeason, getLiturgicalWeek } from '../assets/data/calendar';
import { CelebrationRank } from '../types/celebrations-types';

export class LiturgicalCalendarService {
  private static instance: LiturgicalCalendarService;
  private saints: Map<string, Saint> = new Map();



  private constructor() {
    this.initializeSaints();
    // No need to initialize feasts since we're using new calendar functions
  }

  public static getInstance(): LiturgicalCalendarService {
    if (!LiturgicalCalendarService.instance) {
      LiturgicalCalendarService.instance = new LiturgicalCalendarService();
    }
    return LiturgicalCalendarService.instance;
  }





  // Get liturgical day for a specific date
  public getLiturgicalDay(date: Date): LiturgicalDay {
    // Use new calendar functions
    const season = getLiturgicalSeason(date);
    const week = getLiturgicalWeek(date, season);
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Extract week number from week string (e.g., "Week 3 of Advent" -> 3)
    const weekMatch = week.match(/\d+/);
    const weekNumber = weekMatch ? parseInt(weekMatch[0]) : 1;

    // Get feasts for this date
    const feasts = this.getFeastsForDate(date);

    return {
      date: dateString,
      season: {
        name: season.name,
        color: season.color,
        startDate: '', // Not provided by new functions
        endDate: '',   // Not provided by new functions
        description: season.description
      },
      week: weekNumber,
      dayOfWeek: date.getDay(),
      feasts: feasts,
      color: season.color
    };
  }

  // Initialize saints database
  private initializeSaints(): void {
    const dominicanSaints: Saint[] = [
      {
        id: 'st-thomas-aquinas',
        name: 'St. Thomas Aquinas',
        feastDay: '2024-01-28',
        birthDate: '1225-01-28',
        deathDate: '1274-03-07',
        canonizationDate: '1323-07-18',
        patronages: ['Catholic schools', 'Theologians', 'Students'],
        biography: 'Dominican priest, philosopher, and Doctor of the Church. Known as the Angelic Doctor.',
        isDominican: true,
        order: 'Dominican Order'
      },
      {
        id: 'st-dominic',
        name: 'St. Dominic',
        feastDay: '2024-08-08',
        birthDate: '1170-08-08',
        deathDate: '1221-08-06',
        canonizationDate: '1234-07-13',
        patronages: ['Dominican Order', 'Astronomers', 'Scientists'],
        biography: 'Founder of the Order of Preachers (Dominicans).',
        isDominican: true,
        order: 'Dominican Order'
      },
      {
        id: 'st-catherine-of-siena',
        name: 'St. Catherine of Siena',
        feastDay: '2024-04-29',
        birthDate: '1347-03-25',
        deathDate: '1380-04-29',
        canonizationDate: '1461-06-29',
        patronages: ['Italy', 'Nurses', 'Fire prevention'],
        biography: 'Dominican tertiary, mystic, and Doctor of the Church.',
        isDominican: true,
        order: 'Dominican Order'
      }
    ];

    dominicanSaints.forEach(saint => {
      this.saints.set(saint.id, saint);
    });
  }



  // Get feasts for a specific date
  public getFeastsForDate(date: Date): Celebration[] {
    // Use new calendar function instead of hardcoded data
    return getCelebrationsForDate(date);
  }

  // Get all saints
  public getAllSaints(): Saint[] {
    return Array.from(this.saints.values());
  }

  // Get Dominican saints
  public getDominicanSaints(): Saint[] {
    return Array.from(this.saints.values()).filter(saint => saint.isDominican);
  }

  // Get saint by ID
  public getSaintById(id: string): Saint | undefined {
    return this.saints.get(id);
  }

  // Get feasts for a date range
  public getFeastsForDateRange(startDate: Date, endDate: Date): Celebration[] {
    const feasts: Celebration[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayFeasts = this.getFeastsForDate(currentDate);
      feasts.push(...dayFeasts);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return feasts;
  }

  // Get upcoming feasts
  public getUpcomingFeasts(days: number = 30): Celebration[] {
    const today = new Date();
    const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return this.getFeastsForDateRange(today, endDate);
  }

  // Get liturgical season for a date
  public getLiturgicalSeason(date: Date): LiturgicalSeason {
    // Use new calendar function
    const season = getLiturgicalSeason(date);
    
    return {
      name: season.name,
      color: season.color,
      startDate: '', // Not provided by new functions
      endDate: '',   // Not provided by new functions
      description: season.description
    };
  }

  // Check if date is a feast day
  public isFeastDay(date: Date): boolean {
    const dateString = format(date, 'yyyy-MM-dd');
    const feasts = this.getFeastsForDate(date);
    return feasts.length > 0;
  }

  // Get next feast day
  public getNextFeastDay(fromDate: Date = new Date()): Celebration | null {
    const upcomingFeasts = this.getUpcomingFeasts(365);
    return upcomingFeasts.length > 0 ? upcomingFeasts[0] : null;
  }
}

export default LiturgicalCalendarService;
