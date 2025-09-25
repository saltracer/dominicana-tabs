import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  category: 'theology' | 'spirituality' | 'philosophy' | 'history' | 'liturgy';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // days
  books: {
    bookId: string;
    order: number;
    chaptersPerDay: number;
    estimatedTime: number; // minutes
  }[];
  prerequisites: string[];
  goals: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

interface UserReadingPlan {
  id: string;
  planId: string;
  userId: string;
  startDate: string;
  endDate?: string;
  currentBookIndex: number;
  currentChapter: number;
  progress: number; // percentage
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  dailyGoals: {
    date: string;
    chaptersRead: number;
    timeSpent: number;
    completed: boolean;
  }[];
  achievements: string[];
}

interface ReadingChallenge {
  id: string;
  name: string;
  description: string;
  type: 'books' | 'time' | 'streak' | 'category';
  target: number;
  duration: number; // days
  reward: string;
  participants: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

class ReadingPlansService {
  private static readonly PLANS_KEY = 'reading_plans';
  private static readonly USER_PLANS_KEY = 'user_reading_plans';
  private static readonly CHALLENGES_KEY = 'reading_challenges';

  /**
   * Get all available reading plans
   */
  async getReadingPlans(category?: string): Promise<ReadingPlan[]> {
    const plans = await this.getPlans();
    let filteredPlans = Object.values(plans);
    
    if (category) {
      filteredPlans = filteredPlans.filter(plan => plan.category === category);
    }
    
    return filteredPlans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get a specific reading plan
   */
  async getReadingPlan(planId: string): Promise<ReadingPlan | null> {
    const plans = await this.getPlans();
    return plans[planId] || null;
  }

  /**
   * Start a reading plan
   */
  async startReadingPlan(planId: string, userId: string): Promise<string> {
    const plan = await this.getReadingPlan(planId);
    if (!plan) {
      throw new Error('Reading plan not found');
    }

    const userPlanId = `user_plan_${Date.now()}`;
    const userPlan: UserReadingPlan = {
      id: userPlanId,
      planId,
      userId,
      startDate: new Date().toISOString(),
      currentBookIndex: 0,
      currentChapter: 1,
      progress: 0,
      status: 'active',
      dailyGoals: this.generateDailyGoals(plan),
      achievements: []
    };

    const userPlans = await this.getUserPlans();
    userPlans[userPlanId] = userPlan;
    await AsyncStorage.setItem(
      ReadingPlansService.USER_PLANS_KEY,
      JSON.stringify(userPlans)
    );

    return userPlanId;
  }

  /**
   * Get user's active reading plans
   */
  async getUserActivePlans(userId: string): Promise<UserReadingPlan[]> {
    const userPlans = await this.getUserPlans();
    return Object.values(userPlans)
      .filter(plan => plan.userId === userId && plan.status === 'active')
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  /**
   * Update reading plan progress
   */
  async updatePlanProgress(userPlanId: string, progress: {
    bookIndex: number;
    chapter: number;
    timeSpent: number;
  }): Promise<void> {
    const userPlans = await this.getUserPlans();
    const userPlan = userPlans[userPlanId];
    
    if (!userPlan) {
      throw new Error('User reading plan not found');
    }

    // Update current position
    userPlan.currentBookIndex = progress.bookIndex;
    userPlan.currentChapter = progress.chapter;

    // Update daily goal
    const today = new Date().toDateString();
    const todayGoal = userPlan.dailyGoals.find(goal => 
      new Date(goal.date).toDateString() === today
    );
    
    if (todayGoal) {
      todayGoal.chaptersRead += 1;
      todayGoal.timeSpent += progress.timeSpent;
      todayGoal.completed = todayGoal.chaptersRead >= userPlan.dailyGoals[0].chaptersRead;
    }

    // Calculate overall progress
    const totalChapters = userPlan.dailyGoals.reduce((sum, goal) => sum + goal.chaptersRead, 0);
    const plan = await this.getReadingPlan(userPlan.planId);
    if (plan) {
      const totalPlanChapters = plan.books.reduce((sum, book) => sum + book.chaptersPerDay, 0);
      userPlan.progress = Math.min((totalChapters / totalPlanChapters) * 100, 100);
    }

    // Check for completion
    if (userPlan.progress >= 100) {
      userPlan.status = 'completed';
      userPlan.endDate = new Date().toISOString();
      await this.checkPlanAchievements(userPlan);
    }

    userPlans[userPlanId] = userPlan;
    await AsyncStorage.setItem(
      ReadingPlansService.USER_PLANS_KEY,
      JSON.stringify(userPlans)
    );
  }

  /**
   * Pause a reading plan
   */
  async pauseReadingPlan(userPlanId: string): Promise<void> {
    const userPlans = await this.getUserPlans();
    if (userPlans[userPlanId]) {
      userPlans[userPlanId].status = 'paused';
      await AsyncStorage.setItem(
        ReadingPlansService.USER_PLANS_KEY,
        JSON.stringify(userPlans)
      );
    }
  }

  /**
   * Resume a reading plan
   */
  async resumeReadingPlan(userPlanId: string): Promise<void> {
    const userPlans = await this.getUserPlans();
    if (userPlans[userPlanId]) {
      userPlans[userPlanId].status = 'active';
      await AsyncStorage.setItem(
        ReadingPlansService.USER_PLANS_KEY,
        JSON.stringify(userPlans)
      );
    }
  }

  /**
   * Get reading plan recommendations
   */
  async getPlanRecommendations(userId: string): Promise<ReadingPlan[]> {
    // In a real implementation, this would analyze user preferences and reading history
    const plans = await this.getReadingPlans();
    return plans.slice(0, 5); // Return top 5 plans
  }

  /**
   * Create a custom reading plan
   */
  async createCustomPlan(plan: Omit<ReadingPlan, 'id' | 'createdAt'>): Promise<string> {
    const planId = `plan_${Date.now()}`;
    const newPlan: ReadingPlan = {
      ...plan,
      id: planId,
      createdAt: new Date().toISOString()
    };

    const plans = await this.getPlans();
    plans[planId] = newPlan;
    await AsyncStorage.setItem(
      ReadingPlansService.PLANS_KEY,
      JSON.stringify(plans)
    );

    return planId;
  }

  /**
   * Get reading challenges
   */
  async getReadingChallenges(): Promise<ReadingChallenge[]> {
    const challenges = await this.getChallenges();
    return Object.values(challenges)
      .filter(challenge => challenge.isActive)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  /**
   * Join a reading challenge
   */
  async joinChallenge(challengeId: string, userId: string): Promise<void> {
    const challenges = await this.getChallenges();
    if (challenges[challengeId] && !challenges[challengeId].participants.includes(userId)) {
      challenges[challengeId].participants.push(userId);
      await AsyncStorage.setItem(
        ReadingPlansService.CHALLENGES_KEY,
        JSON.stringify(challenges)
      );
    }
  }

  /**
   * Get user's reading statistics
   */
  async getUserReadingStats(userId: string): Promise<{
    plansCompleted: number;
    totalTimeSpent: number;
    averageProgress: number;
    currentStreak: number;
    achievements: string[];
  }> {
    const userPlans = await this.getUserPlans();
    const userPlanList = Object.values(userPlans).filter(plan => plan.userId === userId);
    
    const plansCompleted = userPlanList.filter(plan => plan.status === 'completed').length;
    const totalTimeSpent = userPlanList.reduce((sum, plan) => 
      sum + plan.dailyGoals.reduce((goalSum, goal) => goalSum + goal.timeSpent, 0), 0
    );
    const averageProgress = userPlanList.length > 0 
      ? userPlanList.reduce((sum, plan) => sum + plan.progress, 0) / userPlanList.length 
      : 0;
    
    // Calculate current streak
    const currentStreak = this.calculateReadingStreak(userPlanList);
    
    // Get all achievements
    const achievements = userPlanList.reduce((acc, plan) => [...acc, ...plan.achievements], []);

    return {
      plansCompleted,
      totalTimeSpent,
      averageProgress,
      currentStreak,
      achievements: [...new Set(achievements)]
    };
  }

  /**
   * Generate daily goals for a plan
   */
  private generateDailyGoals(plan: ReadingPlan): UserReadingPlan['dailyGoals'] {
    const goals = [];
    const startDate = new Date();
    
    for (let i = 0; i < plan.duration; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      goals.push({
        date: date.toISOString(),
        chaptersRead: 0,
        timeSpent: 0,
        completed: false
      });
    }
    
    return goals;
  }

  /**
   * Check for plan achievements
   */
  private async checkPlanAchievements(userPlan: UserReadingPlan): Promise<void> {
    const achievements = [...userPlan.achievements];
    
    // First plan completion
    if (!achievements.includes('first_plan_completed')) {
      achievements.push('first_plan_completed');
    }
    
    // Perfect week achievement
    const lastWeek = userPlan.dailyGoals.slice(-7);
    if (lastWeek.every(goal => goal.completed) && !achievements.includes('perfect_week')) {
      achievements.push('perfect_week');
    }
    
    // Speed reader achievement
    const totalTime = userPlan.dailyGoals.reduce((sum, goal) => sum + goal.timeSpent, 0);
    if (totalTime < 1000 && !achievements.includes('speed_reader')) { // Less than 16.7 hours
      achievements.push('speed_reader');
    }
    
    userPlan.achievements = achievements;
  }

  /**
   * Calculate reading streak
   */
  private calculateReadingStreak(userPlans: UserReadingPlan[]): number {
    // This would calculate consecutive days of reading
    // For now, return a simple calculation
    return userPlans.filter(plan => plan.status === 'completed').length;
  }

  /**
   * Get all plans
   */
  private async getPlans(): Promise<Record<string, ReadingPlan>> {
    try {
      const data = await AsyncStorage.getItem(ReadingPlansService.PLANS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting plans:', error);
      return {};
    }
  }

  /**
   * Get all user plans
   */
  private async getUserPlans(): Promise<Record<string, UserReadingPlan>> {
    try {
      const data = await AsyncStorage.getItem(ReadingPlansService.USER_PLANS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting user plans:', error);
      return {};
    }
  }

  /**
   * Get all challenges
   */
  private async getChallenges(): Promise<Record<string, ReadingChallenge>> {
    try {
      const data = await AsyncStorage.getItem(ReadingPlansService.CHALLENGES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting challenges:', error);
      return {};
    }
  }
}

export default new ReadingPlansService();