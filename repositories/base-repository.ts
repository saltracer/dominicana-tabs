/**
 * Base repository pattern for centralized data access
 */

import { supabase } from '../lib/supabase';
import { ApiResult, PaginationParams, SearchParams } from '../types/api-types';
import { AppError, ErrorHandler } from '../lib/errors';
import { globalCache } from '../lib/cache-manager';

export interface RepositoryConfig {
  tableName: string;
  cacheKey?: string;
  cacheTtl?: number;
}

export abstract class BaseRepository<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  protected config: RepositoryConfig;

  constructor(config: RepositoryConfig) {
    this.config = config;
  }

  /**
   * Get all records
   */
  async getAll(params?: PaginationParams): Promise<ApiResult<T[]>> {
    try {
      const cacheKey = this.getCacheKey('all', params);
      const cached = globalCache.get<T[]>(cacheKey);
      if (cached) {
        return { data: cached, error: null, loading: false };
      }

      let query = supabase.from(this.config.tableName).select('*');

      if (params?.limit) {
        query = query.limit(params.limit);
      }
      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new AppError('DATABASE_ERROR', `Failed to fetch ${this.config.tableName}`, error);
      }

      const result = data || [];
      globalCache.set(cacheKey, result, this.config.cacheTtl);
      return { data: result, error: null, loading: false };
    } catch (error) {
      return { data: null, error: ErrorHandler.createApiError(error), loading: false };
    }
  }

  /**
   * Get record by ID
   */
  async getById(id: string | number): Promise<ApiResult<T | null>> {
    try {
      const cacheKey = this.getCacheKey('byId', { id });
      const cached = globalCache.get<T>(cacheKey);
      if (cached) {
        return { data: cached, error: null, loading: false };
      }

      const { data, error } = await supabase
        .from(this.config.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null, loading: false };
        }
        throw new AppError('DATABASE_ERROR', `Failed to fetch ${this.config.tableName} by ID`, error);
      }

      globalCache.set(cacheKey, data, this.config.cacheTtl);
      return { data, error: null, loading: false };
    } catch (error) {
      return { data: null, error: ErrorHandler.createApiError(error), loading: false };
    }
  }

  /**
   * Search records
   */
  async search(params: SearchParams): Promise<ApiResult<T[]>> {
    try {
      const cacheKey = this.getCacheKey('search', params);
      const cached = globalCache.get<T[]>(cacheKey);
      if (cached) {
        return { data: cached, error: null, loading: false };
      }

      let query = supabase.from(this.config.tableName).select('*');

      // Apply filters
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply search query
      if (params.query) {
        query = this.applySearchQuery(query, params.query);
      }

      // Apply sorting
      if (params.sort) {
        query = query.order(params.sort.field, { ascending: params.sort.direction === 'asc' });
      }

      const { data, error } = await query;

      if (error) {
        throw new AppError('DATABASE_ERROR', `Failed to search ${this.config.tableName}`, error);
      }

      const result = data || [];
      globalCache.set(cacheKey, result, this.config.cacheTtl);
      return { data: result, error: null, loading: false };
    } catch (error) {
      return { data: null, error: ErrorHandler.createApiError(error), loading: false };
    }
  }

  /**
   * Create new record
   */
  async create(data: TCreate): Promise<ApiResult<T>> {
    try {
      const { data: result, error } = await supabase
        .from(this.config.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new AppError('DATABASE_ERROR', `Failed to create ${this.config.tableName}`, error);
      }

      // Invalidate cache
      this.invalidateCache();
      return { data: result, error: null, loading: false };
    } catch (error) {
      return { data: null, error: ErrorHandler.createApiError(error), loading: false };
    }
  }

  /**
   * Update record
   */
  async update(id: string | number, data: TUpdate): Promise<ApiResult<T>> {
    try {
      const { data: result, error } = await supabase
        .from(this.config.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new AppError('DATABASE_ERROR', `Failed to update ${this.config.tableName}`, error);
      }

      // Invalidate cache
      this.invalidateCache();
      return { data: result, error: null, loading: false };
    } catch (error) {
      return { data: null, error: ErrorHandler.createApiError(error), loading: false };
    }
  }

  /**
   * Delete record
   */
  async delete(id: string | number): Promise<ApiResult<boolean>> {
    try {
      const { error } = await supabase
        .from(this.config.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw new AppError('DATABASE_ERROR', `Failed to delete ${this.config.tableName}`, error);
      }

      // Invalidate cache
      this.invalidateCache();
      return { data: true, error: null, loading: false };
    } catch (error) {
      return { data: false, error: ErrorHandler.createApiError(error), loading: false };
    }
  }

  /**
   * Invalidate cache for this repository
   */
  invalidateCache(): void {
    if (this.config.cacheKey) {
      globalCache.invalidate(this.config.cacheKey);
    }
  }

  /**
   * Get cache key for operation
   */
  protected getCacheKey(operation: string, params?: any): string {
    const baseKey = this.config.cacheKey || this.config.tableName;
    const paramString = params ? JSON.stringify(params) : '';
    return `${baseKey}:${operation}:${paramString}`;
  }

  /**
   * Apply search query to Supabase query
   * Override in subclasses for custom search logic
   */
  protected applySearchQuery(query: any, searchQuery: string): any {
    // Default implementation - override in subclasses
    return query;
  }
}
