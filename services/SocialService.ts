import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReadingShare {
  id: string;
  bookId: string;
  userId: string;
  type: 'quote' | 'bookmark' | 'progress' | 'review';
  content: string;
  position?: string;
  chapter?: string;
  likes: number;
  comments: number;
  createdAt: string;
  isPublic: boolean;
}

interface ReadingComment {
  id: string;
  shareId: string;
  userId: string;
  content: string;
  createdAt: string;
  likes: number;
}

interface ReadingGroup {
  id: string;
  name: string;
  description: string;
  bookId: string;
  members: string[];
  admin: string;
  createdAt: string;
  isPublic: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  readingStats: {
    booksRead: number;
    totalTime: number;
    currentStreak: number;
  };
  favoriteCategories: string[];
  achievements: string[];
}

class SocialService {
  private static readonly SHARES_KEY = 'reading_shares';
  private static readonly COMMENTS_KEY = 'reading_comments';
  private static readonly GROUPS_KEY = 'reading_groups';
  private static readonly PROFILES_KEY = 'user_profiles';

  /**
   * Share a quote or bookmark
   */
  async shareContent(share: Omit<ReadingShare, 'id' | 'likes' | 'comments' | 'createdAt'>): Promise<string> {
    const shareId = `share_${Date.now()}`;
    const newShare: ReadingShare = {
      ...share,
      id: shareId,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString()
    };

    const shares = await this.getShares();
    shares[shareId] = newShare;
    await AsyncStorage.setItem(
      SocialService.SHARES_KEY,
      JSON.stringify(shares)
    );

    return shareId;
  }

  /**
   * Get all shares for a book
   */
  async getBookShares(bookId: string): Promise<ReadingShare[]> {
    const shares = await this.getShares();
    return Object.values(shares).filter(share => share.bookId === bookId);
  }

  /**
   * Get public shares (community feed)
   */
  async getPublicShares(): Promise<ReadingShare[]> {
    const shares = await this.getShares();
    return Object.values(shares)
      .filter(share => share.isPublic)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Like a share
   */
  async likeShare(shareId: string): Promise<void> {
    const shares = await this.getShares();
    if (shares[shareId]) {
      shares[shareId].likes += 1;
      await AsyncStorage.setItem(
        SocialService.SHARES_KEY,
        JSON.stringify(shares)
      );
    }
  }

  /**
   * Add comment to a share
   */
  async addComment(shareId: string, content: string, userId: string): Promise<string> {
    const commentId = `comment_${Date.now()}`;
    const comment: ReadingComment = {
      id: commentId,
      shareId,
      userId,
      content,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    const comments = await this.getComments();
    comments[commentId] = comment;
    await AsyncStorage.setItem(
      SocialService.COMMENTS_KEY,
      JSON.stringify(comments)
    );

    // Update share comment count
    const shares = await this.getShares();
    if (shares[shareId]) {
      shares[shareId].comments += 1;
      await AsyncStorage.setItem(
        SocialService.SHARES_KEY,
        JSON.stringify(shares)
      );
    }

    return commentId;
  }

  /**
   * Get comments for a share
   */
  async getShareComments(shareId: string): Promise<ReadingComment[]> {
    const comments = await this.getComments();
    return Object.values(comments)
      .filter(comment => comment.shareId === shareId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  /**
   * Create a reading group
   */
  async createReadingGroup(group: Omit<ReadingGroup, 'id' | 'createdAt'>): Promise<string> {
    const groupId = `group_${Date.now()}`;
    const newGroup: ReadingGroup = {
      ...group,
      id: groupId,
      createdAt: new Date().toISOString()
    };

    const groups = await this.getGroups();
    groups[groupId] = newGroup;
    await AsyncStorage.setItem(
      SocialService.GROUPS_KEY,
      JSON.stringify(groups)
    );

    return groupId;
  }

  /**
   * Join a reading group
   */
  async joinGroup(groupId: string, userId: string): Promise<void> {
    const groups = await this.getGroups();
    if (groups[groupId] && !groups[groupId].members.includes(userId)) {
      groups[groupId].members.push(userId);
      await AsyncStorage.setItem(
        SocialService.GROUPS_KEY,
        JSON.stringify(groups)
      );
    }
  }

  /**
   * Leave a reading group
   */
  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const groups = await this.getGroups();
    if (groups[groupId]) {
      groups[groupId].members = groups[groupId].members.filter(id => id !== userId);
      await AsyncStorage.setItem(
        SocialService.GROUPS_KEY,
        JSON.stringify(groups)
      );
    }
  }

  /**
   * Get reading groups for a book
   */
  async getBookGroups(bookId: string): Promise<ReadingGroup[]> {
    const groups = await this.getGroups();
    return Object.values(groups).filter(group => group.bookId === bookId);
  }

  /**
   * Get public reading groups
   */
  async getPublicGroups(): Promise<ReadingGroup[]> {
    const groups = await this.getGroups();
    return Object.values(groups).filter(group => group.isPublic);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profile: UserProfile): Promise<void> {
    const profiles = await this.getProfiles();
    profiles[profile.id] = profile;
    await AsyncStorage.setItem(
      SocialService.PROFILES_KEY,
      JSON.stringify(profiles)
    );
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const profiles = await this.getProfiles();
    return profiles[userId] || null;
  }

  /**
   * Get reading leaderboard
   */
  async getReadingLeaderboard(): Promise<UserProfile[]> {
    const profiles = await this.getProfiles();
    return Object.values(profiles)
      .sort((a, b) => b.readingStats.booksRead - a.readingStats.booksRead)
      .slice(0, 10);
  }

  /**
   * Share reading progress
   */
  async shareProgress(bookId: string, progress: {
    currentChapter: number;
    totalChapters: number;
    percentage: number;
  }, userId: string): Promise<string> {
    return this.shareContent({
      bookId,
      userId,
      type: 'progress',
      content: `I'm ${progress.percentage}% through this amazing book!`,
      position: `${progress.currentChapter}/${progress.totalChapters}`,
      chapter: `Chapter ${progress.currentChapter}`,
      isPublic: true
    });
  }

  /**
   * Share a quote
   */
  async shareQuote(bookId: string, quote: string, position: string, userId: string): Promise<string> {
    return this.shareContent({
      bookId,
      userId,
      type: 'quote',
      content: `"${quote}"`,
      position,
      isPublic: true
    });
  }

  /**
   * Share a review
   */
  async shareReview(bookId: string, review: string, rating: number, userId: string): Promise<string> {
    return this.shareContent({
      bookId,
      userId,
      type: 'review',
      content: `⭐ ${rating}/5 - ${review}`,
      isPublic: true
    });
  }

  /**
   * Get user's shares
   */
  async getUserShares(userId: string): Promise<ReadingShare[]> {
    const shares = await this.getShares();
    return Object.values(shares)
      .filter(share => share.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get trending books
   */
  async getTrendingBooks(): Promise<{ bookId: string; shares: number; likes: number }[]> {
    const shares = await this.getShares();
    const bookStats: Record<string, { shares: number; likes: number }> = {};

    Object.values(shares).forEach(share => {
      if (!bookStats[share.bookId]) {
        bookStats[share.bookId] = { shares: 0, likes: 0 };
      }
      bookStats[share.bookId].shares += 1;
      bookStats[share.bookId].likes += share.likes;
    });

    return Object.entries(bookStats)
      .map(([bookId, stats]) => ({ bookId, ...stats }))
      .sort((a, b) => (b.shares + b.likes) - (a.shares + a.likes))
      .slice(0, 10);
  }

  /**
   * Get all shares
   */
  private async getShares(): Promise<Record<string, ReadingShare>> {
    try {
      const data = await AsyncStorage.getItem(SocialService.SHARES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting shares:', error);
      return {};
    }
  }

  /**
   * Get all comments
   */
  private async getComments(): Promise<Record<string, ReadingComment>> {
    try {
      const data = await AsyncStorage.getItem(SocialService.COMMENTS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting comments:', error);
      return {};
    }
  }

  /**
   * Get all groups
   */
  private async getGroups(): Promise<Record<string, ReadingGroup>> {
    try {
      const data = await AsyncStorage.getItem(SocialService.GROUPS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting groups:', error);
      return {};
    }
  }

  /**
   * Get all profiles
   */
  private async getProfiles(): Promise<Record<string, UserProfile>> {
    try {
      const data = await AsyncStorage.getItem(SocialService.PROFILES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting profiles:', error);
      return {};
    }
  }
}

export default new SocialService();