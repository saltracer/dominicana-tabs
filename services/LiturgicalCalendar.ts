import { LiturgicalDay, LiturgicalSeason, Feast, Saint } from '../types';

export class LiturgicalCalendarService {
  private static instance: LiturgicalCalendarService;
  private saints: Map<string, Saint> = new Map();
  private feasts: Map<string, Feast[]> = new Map();

  private constructor() {
    this.initializeSaints();
    this.initializeFeasts();
  }

  public static getInstance(): LiturgicalCalendarService {
    if (!LiturgicalCalendarService.instance) {
      LiturgicalCalendarService.instance = new LiturgicalCalendarService();
    }
    return LiturgicalCalendarService.instance;
  }

  // Calculate Easter Sunday using Meeus/Jones/Butcher algorithm
  private calculateEaster(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month - 1, day);
  }

  // Calculate liturgical seasons
  private calculateLiturgicalSeasons(year: number): LiturgicalSeason[] {
    const easter = this.calculateEaster(year);
    const ashWednesday = new Date(easter.getTime() - (46 * 24 * 60 * 60 * 1000));
    const pentecost = new Date(easter.getTime() + (49 * 24 * 60 * 60 * 1000));
    const trinitySunday = new Date(pentecost.getTime() + (7 * 24 * 60 * 60 * 1000));
    const christTheKing = new Date(year, 10, 20); // Last Sunday of Ordinary Time
    const firstSundayAdvent = new Date(year, 11, 1);
    
    // Find the first Sunday of Advent
    while (firstSundayAdvent.getDay() !== 0) {
      firstSundayAdvent.setDate(firstSundayAdvent.getDate() + 1);
    }

    return [
      {
        name: 'Advent',
        color: '#4B0082',
        startDate: firstSundayAdvent.toISOString(),
        endDate: new Date(year, 11, 24, 23, 59, 59).toISOString(),
        description: 'Season of preparation for the coming of Christ'
      },
      {
        name: 'Christmas',
        color: '#FFFFFF',
        startDate: new Date(year, 11, 25).toISOString(),
        endDate: new Date(year + 1, 0, 5, 23, 59, 59).toISOString(),
        description: 'Celebration of the birth of Jesus Christ'
      },
      {
        name: 'Ordinary Time I',
        color: '#2E7D32',
        startDate: new Date(year + 1, 0, 6).toISOString(),
        endDate: new Date(ashWednesday.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'First period of Ordinary Time'
      },
      {
        name: 'Lent',
        color: '#6A1B9A',
        startDate: ashWednesday.toISOString(),
        endDate: new Date(easter.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Season of penance and preparation for Easter'
      },
      {
        name: 'Easter',
        color: '#FFFFFF',
        startDate: easter.toISOString(),
        endDate: new Date(pentecost.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Celebration of the Resurrection of Christ'
      },
      {
        name: 'Ordinary Time II',
        color: '#2E7D32',
        startDate: new Date(pentecost.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(firstSundayAdvent.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Second period of Ordinary Time'
      }
    ];
  }

  // Get liturgical day for a specific date
  public getLiturgicalDay(date: Date): LiturgicalDay {
    const year = date.getFullYear();
    const seasons = this.calculateLiturgicalSeasons(year);
    const dateString = date.toISOString().split('T')[0];
    
    // Find current season
    const currentSeason = seasons.find(season => {
      const start = new Date(season.startDate);
      const end = new Date(season.endDate);
      return date >= start && date <= end;
    }) || seasons[0];

    // Calculate week number within the season
    const seasonStart = new Date(currentSeason.startDate);
    const week = Math.floor((date.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

    // Get feasts for this date
    const feasts = this.getFeastsForDate(dateString);

    return {
      date: dateString,
      season: currentSeason,
      week: Math.max(1, week),
      dayOfWeek: date.getDay(),
      feasts: feasts,
      color: currentSeason.color
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

  // Initialize feasts database
  private initializeFeasts(): void {
    const feasts: { [key: string]: Feast[] } = {
      '2024-01-28': [
        {
          id: 'st-thomas-aquinas-feast',
          name: 'St. Thomas Aquinas',
          rank: 'feast',
          type: 'dominican',
          color: '#8B0000',
          description: 'Feast of St. Thomas Aquinas, Dominican priest and Doctor of the Church',
          saint: this.saints.get('st-thomas-aquinas'),
          isDominican: true,
          date: '2024-01-28'
        }
      ],
      '2024-04-29': [
        {
          id: 'st-catherine-feast',
          name: 'St. Catherine of Siena',
          rank: 'feast',
          type: 'universal',
          color: '#8B0000',
          description: 'Feast of St. Catherine of Siena, Dominican tertiary and Doctor of the Church',
          saint: this.saints.get('st-catherine-of-siena'),
          isDominican: true,
          date: '2024-04-29'
        }
      ],
      '2024-08-08': [
        {
          id: 'st-dominic-feast',
          name: 'St. Dominic',
          rank: 'feast',
          type: 'universal',
          color: '#8B0000',
          description: 'Feast of St. Dominic, founder of the Order of Preachers',
          saint: this.saints.get('st-dominic'),
          isDominican: true,
          date: '2024-08-08'
        }
      ],
      '2024-12-25': [
        {
          id: 'christmas-solemnity',
          name: 'Christmas',
          rank: 'solemnity',
          type: 'universal',
          color: '#FFFFFF',
          description: 'Solemnity of the Nativity of the Lord',
          isDominican: false,
          date: '2024-12-25'
        }
      ]
    };

    Object.entries(feasts).forEach(([date, feastList]) => {
      this.feasts.set(date, feastList);
    });
  }

  // Get feasts for a specific date
  private getFeastsForDate(dateString: string): Feast[] {
    return this.feasts.get(dateString) || [];
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
  public getFeastsForDateRange(startDate: Date, endDate: Date): Feast[] {
    const feasts: Feast[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayFeasts = this.getFeastsForDate(dateString);
      feasts.push(...dayFeasts);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return feasts;
  }

  // Get upcoming feasts
  public getUpcomingFeasts(days: number = 30): Feast[] {
    const today = new Date();
    const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return this.getFeastsForDateRange(today, endDate);
  }

  // Get liturgical season for a date
  public getLiturgicalSeason(date: Date): LiturgicalSeason {
    const year = date.getFullYear();
    const seasons = this.calculateLiturgicalSeasons(year);
    
    return seasons.find(season => {
      const start = new Date(season.startDate);
      const end = new Date(season.endDate);
      return date >= start && date <= end;
    }) || seasons[0];
  }

  // Check if date is a feast day
  public isFeastDay(date: Date): boolean {
    const dateString = date.toISOString().split('T')[0];
    const feasts = this.getFeastsForDate(dateString);
    return feasts.length > 0;
  }

  // Get next feast day
  public getNextFeastDay(fromDate: Date = new Date()): Feast | null {
    const upcomingFeasts = this.getUpcomingFeasts(365);
    return upcomingFeasts.length > 0 ? upcomingFeasts[0] : null;
  }
}

export default LiturgicalCalendarService;
