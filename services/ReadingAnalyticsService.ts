import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReadingSession {
  id: string;
  bookId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  pagesRead: number;
  chaptersRead: number;
  wordsRead: number;
  readingSpeed: number; // words per minute
}

interface ReadingHabit {
  bookId: string;
  totalTimeSpent: number;
  totalSessions: number;
  averageSessionLength: number;
  readingStreak: number;
  lastReadDate: string;
  favoriteReadingTime: string;
  readingGoals: {
    daily: number; // minutes
    weekly: number; // minutes
    monthly: number; // minutes
  };
  achievements: string[];
}

interface ReadingStats {
  totalBooksRead: number;
  totalTimeSpent: number;
  totalWordsRead: number;
  averageReadingSpeed: number;
  longestStreak: number;
  currentStreak: number;
  favoriteCategory: string;
  readingGoals: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  achievements: string[];
}

class ReadingAnalyticsService {
  private static readonly SESSIONS_KEY = 'reading_sessions';
  private static readonly HABITS_KEY = 'reading_habits';
  private static readonly STATS_KEY = 'reading_stats';

  /**
   * Start a new reading session
   */
  async startReadingSession(bookId: string): Promise<string> {
    const sessionId = `session_${Date.now()}`;
    const session: ReadingSession = {
      id: sessionId,
      bookId,
      startTime: new Date().toISOString(),
      duration: 0,
      pagesRead: 0,
      chaptersRead: 0,
      wordsRead: 0,
      readingSpeed: 0
    };

    const sessions = await this.getReadingSessions();
    sessions[sessionId] = session;
    await AsyncStorage.setItem(
      ReadingAnalyticsService.SESSIONS_KEY,
      JSON.stringify(sessions)
    );

    return sessionId;
  }

  /**
   * End a reading session
   */
  async endReadingSession(sessionId: string, stats: {
    pagesRead: number;
    chaptersRead: number;
    wordsRead: number;
  }): Promise<void> {
    const sessions = await this.getReadingSessions();
    const session = sessions[sessionId];
    
    if (session) {
      const endTime = new Date();
      const startTime = new Date(session.startTime);
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      
      session.endTime = endTime.toISOString();
      session.duration = duration;
      session.pagesRead = stats.pagesRead;
      session.chaptersRead = stats.chaptersRead;
      session.wordsRead = stats.wordsRead;
      session.readingSpeed = duration > 0 ? Math.floor((stats.wordsRead / duration) * 60) : 0;

      sessions[sessionId] = session;
      await AsyncStorage.setItem(
        ReadingAnalyticsService.SESSIONS_KEY,
        JSON.stringify(sessions)
      );

      // Update reading habits
      await this.updateReadingHabits(session);
    }
  }

  /**
   * Get all reading sessions
   */
  async getReadingSessions(): Promise<Record<string, ReadingSession>> {
    try {
      const data = await AsyncStorage.getItem(ReadingAnalyticsService.SESSIONS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting reading sessions:', error);
      return {};
    }
  }

  /**
   * Get reading sessions for a specific book
   */
  async getBookReadingSessions(bookId: string): Promise<ReadingSession[]> {
    const sessions = await this.getReadingSessions();
    return Object.values(sessions).filter(session => session.bookId === bookId);
  }

  /**
   * Update reading habits based on session
   */
  private async updateReadingHabits(session: ReadingSession): Promise<void> {
    const habits = await this.getReadingHabits();
    const bookId = session.bookId;
    
    if (!habits[bookId]) {
      habits[bookId] = {
        bookId,
        totalTimeSpent: 0,
        totalSessions: 0,
        averageSessionLength: 0,
        readingStreak: 0,
        lastReadDate: '',
        favoriteReadingTime: '',
        readingGoals: {
          daily: 30,
          weekly: 210,
          monthly: 900
        },
        achievements: []
      };
    }

    const habit = habits[bookId];
    habit.totalTimeSpent += session.duration;
    habit.totalSessions += 1;
    habit.averageSessionLength = habit.totalTimeSpent / habit.totalSessions;
    habit.lastReadDate = session.endTime || session.startTime;

    // Calculate reading streak
    const today = new Date().toDateString();
    const lastRead = new Date(habit.lastReadDate).toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (lastRead === today) {
      habit.readingStreak += 1;
    } else if (lastRead === yesterday) {
      // Continue streak
    } else {
      habit.readingStreak = 1;
    }

    // Update favorite reading time
    const sessionHour = new Date(session.startTime).getHours();
    habit.favoriteReadingTime = this.getTimeOfDay(sessionHour);

    // Check for achievements
    await this.checkAchievements(habit);

    habits[bookId] = habit;
    await AsyncStorage.setItem(
      ReadingAnalyticsService.HABITS_KEY,
      JSON.stringify(habits)
    );
  }

  /**
   * Get reading habits for a book
   */
  async getReadingHabits(bookId?: string): Promise<Record<string, ReadingHabit> | ReadingHabit | null> {
    try {
      const data = await AsyncStorage.getItem(ReadingAnalyticsService.HABITS_KEY);
      const habits = data ? JSON.parse(data) : {};
      
      if (bookId) {
        return habits[bookId] || null;
      }
      
      return habits;
    } catch (error) {
      console.error('Error getting reading habits:', error);
      return bookId ? null : {};
    }
  }

  /**
   * Get overall reading statistics
   */
  async getReadingStats(): Promise<ReadingStats> {
    const sessions = await this.getReadingSessions();
    const habits = await this.getReadingHabits();
    
    const totalBooksRead = Object.keys(habits).length;
    const totalTimeSpent = Object.values(sessions).reduce((sum, session) => sum + session.duration, 0);
    const totalWordsRead = Object.values(sessions).reduce((sum, session) => sum + session.wordsRead, 0);
    const averageReadingSpeed = totalTimeSpent > 0 ? Math.floor((totalWordsRead / totalTimeSpent) * 60) : 0;
    
    const longestStreak = Math.max(...Object.values(habits).map(habit => habit.readingStreak), 0);
    const currentStreak = Math.max(...Object.values(habits).map(habit => habit.readingStreak), 0);
    
    return {
      totalBooksRead,
      totalTimeSpent,
      totalWordsRead,
      averageReadingSpeed,
      longestStreak,
      currentStreak,
      favoriteCategory: 'theology', // This would be calculated from book categories
      readingGoals: {
        daily: 30,
        weekly: 210,
        monthly: 900
      },
      achievements: this.getAllAchievements(habits)
    };
  }

  /**
   * Set reading goals
   */
  async setReadingGoals(goals: {
    daily?: number;
    weekly?: number;
    monthly?: number;
  }): Promise<void> {
    const stats = await this.getReadingStats();
    stats.readingGoals = {
      ...stats.readingGoals,
      ...goals
    };
    
    await AsyncStorage.setItem(
      ReadingAnalyticsService.STATS_KEY,
      JSON.stringify(stats)
    );
  }

  /**
   * Get reading progress for today
   */
  async getTodayProgress(): Promise<{
    timeSpent: number;
    booksRead: number;
    wordsRead: number;
    goalProgress: number;
  }> {
    const today = new Date().toDateString();
    const sessions = await this.getReadingSessions();
    
    const todaySessions = Object.values(sessions).filter(session => {
      const sessionDate = new Date(session.startTime).toDateString();
      return sessionDate === today;
    });

    const timeSpent = todaySessions.reduce((sum, session) => sum + session.duration, 0);
    const booksRead = new Set(todaySessions.map(session => session.bookId)).size;
    const wordsRead = todaySessions.reduce((sum, session) => sum + session.wordsRead, 0);
    
    const stats = await this.getReadingStats();
    const goalProgress = stats.readingGoals.daily > 0 ? (timeSpent / (stats.readingGoals.daily * 60)) * 100 : 0;

    return {
      timeSpent,
      booksRead,
      wordsRead,
      goalProgress: Math.min(goalProgress, 100)
    };
  }

  /**
   * Get reading streaks
   */
  async getReadingStreaks(): Promise<{
    current: number;
    longest: number;
    lastReadDate: string;
  }> {
    const habits = await this.getReadingHabits();
    const streaks = Object.values(habits).map(habit => habit.readingStreak);
    
    return {
      current: Math.max(...streaks, 0),
      longest: Math.max(...streaks, 0),
      lastReadDate: new Date().toISOString()
    };
  }

  /**
   * Check for achievements
   */
  private async checkAchievements(habit: ReadingHabit): Promise<void> {
    const achievements = [...habit.achievements];

    // First session achievement
    if (habit.totalSessions === 1 && !achievements.includes('first_session')) {
      achievements.push('first_session');
    }

    // Reading streak achievements
    if (habit.readingStreak >= 7 && !achievements.includes('week_streak')) {
      achievements.push('week_streak');
    }

    if (habit.readingStreak >= 30 && !achievements.includes('month_streak')) {
      achievements.push('month_streak');
    }

    // Time-based achievements
    if (habit.totalTimeSpent >= 3600 && !achievements.includes('hour_reader')) {
      achievements.push('hour_reader');
    }

    if (habit.totalTimeSpent >= 36000 && !achievements.includes('dedicated_reader')) {
      achievements.push('dedicated_reader');
    }

    habit.achievements = achievements;
  }

  /**
   * Get all achievements across all books
   */
  private getAllAchievements(habits: Record<string, ReadingHabit>): string[] {
    const allAchievements = new Set<string>();
    Object.values(habits).forEach(habit => {
      habit.achievements.forEach(achievement => allAchievements.add(achievement));
    });
    return Array.from(allAchievements);
  }

  /**
   * Get time of day from hour
   */
  private getTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Export reading data
   */
  async exportReadingData(): Promise<{
    sessions: ReadingSession[];
    habits: Record<string, ReadingHabit>;
    stats: ReadingStats;
  }> {
    const sessions = await this.getReadingSessions();
    const habits = await this.getReadingHabits();
    const stats = await this.getReadingStats();

    return {
      sessions: Object.values(sessions),
      habits: habits as Record<string, ReadingHabit>,
      stats
    };
  }

  /**
   * Clear all analytics data
   */
  async clearAllData(): Promise<void> {
    await AsyncStorage.removeItem(ReadingAnalyticsService.SESSIONS_KEY);
    await AsyncStorage.removeItem(ReadingAnalyticsService.HABITS_KEY);
    await AsyncStorage.removeItem(ReadingAnalyticsService.STATS_KEY);
  }
}

export default new ReadingAnalyticsService();