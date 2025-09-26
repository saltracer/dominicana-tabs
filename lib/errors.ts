/**
 * Centralized error handling system
 */

import { ApiError } from '../types/api-types';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: any, originalError?: Error) {
    super('NETWORK_ERROR', message, details, originalError);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, details?: any) {
    super('AUTH_ERROR', message, details);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super('NOT_FOUND', message, details);
    this.name = 'NotFoundError';
  }
}

export class CacheError extends AppError {
  constructor(message: string, details?: any) {
    super('CACHE_ERROR', message, details);
    this.name = 'CacheError';
  }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  static createApiError(error: unknown): ApiError {
    if (error instanceof AppError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: Date.now(),
      };
    }

    if (error instanceof Error) {
      const details: any = { stack: error.stack };
      
      // Preserve additional properties from the error
      Object.keys(error).forEach(key => {
        if (key !== 'name' && key !== 'message' && key !== 'stack') {
          details[key] = (error as any)[key];
        }
      });

      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        details,
        timestamp: Date.now(),
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: { originalError: error },
      timestamp: Date.now(),
    };
  }

  static isNetworkError(error: unknown): boolean {
    return error instanceof NetworkError;
  }

  static isAuthenticationError(error: unknown): boolean {
    return error instanceof AuthenticationError;
  }

  static isValidationError(error: unknown): boolean {
    return error instanceof ValidationError;
  }

  static isNotFoundError(error: unknown): boolean {
    return error instanceof NotFoundError;
  }

  static shouldRetry(error: unknown): boolean {
    if (error instanceof NetworkError) return true;
    if (error instanceof AppError) {
      return ['NETWORK_ERROR', 'TIMEOUT_ERROR'].includes(error.code);
    }
    return false;
  }
}
