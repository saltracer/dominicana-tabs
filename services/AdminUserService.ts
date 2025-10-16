import { supabase } from '../lib/supabase';

export interface UserFilters {
  search?: string;
  role?: string;
}

export interface UserPagination {
  page: number;
  limit: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserStats {
  total_users: number;
  users_by_role: Record<string, number>;
  recent_signups: number;
  active_readers: number;
}

/**
 * Admin service for managing users
 */
export class AdminUserService {
  /**
   * List users with filters and pagination
   */
  static async listUsers(
    filters: UserFilters = {},
    pagination: UserPagination = { page: 1, limit: 50 }
  ): Promise<UserListResponse> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (filters.search) {
      query = query.or(
        `username.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`
      );
    }

    // Apply pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error listing users:', error);
      throw new Error(`Failed to list users: ${error.message}`);
    }

    // Get all user roles separately
    const userIds = (data || []).map(p => p.id);
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    // Create a map of user_id to role
    const roleMap = new Map<string, string>();
    roles?.forEach(r => {
      roleMap.set(r.user_id, r.role);
    });

    // Transform and merge with roles
    let users = (data || []).map((profile: any) => ({
      id: profile.id,
      email: profile.username, // username is email in profiles
      name: profile.full_name || profile.username,
      username: profile.username,
      role: roleMap.get(profile.id) || 'authenticated',
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    }));

    // Filter by role if specified
    if (filters.role) {
      users = users.filter(u => u.role === filters.role);
    }

    const total = filters.role ? users.length : (count || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Get a single user by ID
   */
  static async getUser(id: string): Promise<AdminUser> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting user:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }

    // Get user role separately
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', id)
      .single();

    return {
      id: data.id,
      email: data.username,
      name: data.full_name || data.username,
      username: data.username,
      role: roleData?.role || 'authenticated',
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  /**
   * Update user profile
   */
  static async updateUser(
    id: string,
    updates: {
      full_name?: string;
      username?: string;
      avatar_url?: string;
    }
  ): Promise<AdminUser> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return this.getUser(id);
  }

  /**
   * Change user role
   */
  static async changeUserRole(userId: string, newRole: string): Promise<void> {
    // Valid roles: admin, subscribed, authenticated
    const validRoles = ['admin', 'subscribed', 'authenticated'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}`);
    }

    // Check if user already has a role entry
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingRole) {
      // Update existing role
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating role:', error);
        throw new Error(`Failed to update role: ${error.message}`);
      }
    } else {
      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole,
        });

      if (error) {
        console.error('Error creating role:', error);
        throw new Error(`Failed to create role: ${error.message}`);
      }
    }
  }

  /**
   * Delete user role (revert to authenticated)
   */
  static async deleteUserRole(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting role:', error);
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  }

  /**
   * Get user statistics for dashboard
   */
  static async getUserStats(): Promise<UserStats> {
    try {
      // Call the database function
      const { data, error } = await supabase.rpc('get_user_statistics');

      if (error) {
        console.error('Error getting user stats:', error);
        throw new Error(`Failed to get user stats: ${error.message}`);
      }

      return data as UserStats;
    } catch (error) {
      console.error('Error in getUserStats:', error);
      // Return default stats if function fails
      return {
        total_users: 0,
        users_by_role: {},
        recent_signups: 0,
        active_readers: 0,
      };
    }
  }

  /**
   * Get reading progress summary for a user
   */
  static async getUserReadingProgress(userId: string): Promise<{
    books_started: number;
    books_completed: number;
    total_reading_time: number;
  }> {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('progress_percentage')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting reading progress:', error);
      return {
        books_started: 0,
        books_completed: 0,
        total_reading_time: 0,
      };
    }

    const books_started = data?.length || 0;
    const books_completed = data?.filter(p => p.progress_percentage >= 100).length || 0;

    return {
      books_started,
      books_completed,
      total_reading_time: 0, // Not tracking this yet
    };
  }

  /**
   * Send password reset email
   */
  static async resetUserPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error('Error sending reset email:', error);
      throw new Error(`Failed to send reset email: ${error.message}`);
    }
  }
}

