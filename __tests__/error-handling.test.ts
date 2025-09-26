/**
 * Tests for error handling system
 */

import {
  AppError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  CacheError,
  ErrorHandler,
} from '../lib/errors';

describe('AppError', () => {
  it('should create AppError with all properties', () => {
    const details = { field: 'name' };
    const originalError = new Error('Original error');
    const error = new AppError('TEST_ERROR', 'Test error message', details, originalError);

    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test error message');
    expect(error.details).toEqual(details);
    expect(error.originalError).toBe(originalError);
    expect(error.name).toBe('AppError');
  });

  it('should create AppError without optional properties', () => {
    const error = new AppError('TEST_ERROR', 'Test error message');

    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test error message');
    expect(error.details).toBeUndefined();
    expect(error.originalError).toBeUndefined();
  });
});

describe('Specialized Error Classes', () => {
  it('should create NetworkError correctly', () => {
    const error = new NetworkError('Network connection failed');

    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toBe('Network connection failed');
    expect(error.name).toBe('NetworkError');
  });

  it('should create ValidationError correctly', () => {
    const details = { field: 'email' };
    const error = new ValidationError('Invalid email format', details);

    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Invalid email format');
    expect(error.details).toEqual(details);
    expect(error.name).toBe('ValidationError');
  });

  it('should create AuthenticationError correctly', () => {
    const error = new AuthenticationError('Invalid credentials');

    expect(error.code).toBe('AUTH_ERROR');
    expect(error.message).toBe('Invalid credentials');
    expect(error.name).toBe('AuthenticationError');
  });

  it('should create NotFoundError correctly', () => {
    const error = new NotFoundError('Resource not found');

    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
    expect(error.name).toBe('NotFoundError');
  });

  it('should create CacheError correctly', () => {
    const error = new CacheError('Cache operation failed');

    expect(error.code).toBe('CACHE_ERROR');
    expect(error.message).toBe('Cache operation failed');
    expect(error.name).toBe('CacheError');
  });
});

describe('ErrorHandler', () => {
  describe('createApiError', () => {
    it('should convert AppError to ApiError', () => {
      const appError = new AppError('TEST_ERROR', 'Test message', { field: 'name' });
      const apiError = ErrorHandler.createApiError(appError);

      expect(apiError.code).toBe('TEST_ERROR');
      expect(apiError.message).toBe('Test message');
      expect(apiError.details).toEqual({ field: 'name' });
      expect(apiError.timestamp).toBeGreaterThan(0);
    });

    it('should convert regular Error to ApiError', () => {
      const error = new Error('Regular error');
      const apiError = ErrorHandler.createApiError(error);

      expect(apiError.code).toBe('UNKNOWN_ERROR');
      expect(apiError.message).toBe('Regular error');
      expect(apiError.details).toHaveProperty('stack');
      expect(apiError.timestamp).toBeGreaterThan(0);
    });

    it('should handle unknown error types', () => {
      const unknownError = 'String error';
      const apiError = ErrorHandler.createApiError(unknownError);

      expect(apiError.code).toBe('UNKNOWN_ERROR');
      expect(apiError.message).toBe('An unknown error occurred');
      expect(apiError.details).toEqual({ originalError: unknownError });
      expect(apiError.timestamp).toBeGreaterThan(0);
    });

    it('should handle null/undefined errors', () => {
      const apiError = ErrorHandler.createApiError(null);

      expect(apiError.code).toBe('UNKNOWN_ERROR');
      expect(apiError.message).toBe('An unknown error occurred');
      expect(apiError.details).toEqual({ originalError: null });
    });
  });

  describe('Error Type Detection', () => {
    it('should detect NetworkError', () => {
      const networkError = new NetworkError('Network failed');
      const regularError = new Error('Regular error');

      expect(ErrorHandler.isNetworkError(networkError)).toBe(true);
      expect(ErrorHandler.isNetworkError(regularError)).toBe(false);
    });

    it('should detect AuthenticationError', () => {
      const authError = new AuthenticationError('Auth failed');
      const regularError = new Error('Regular error');

      expect(ErrorHandler.isAuthenticationError(authError)).toBe(true);
      expect(ErrorHandler.isAuthenticationError(regularError)).toBe(false);
    });

    it('should detect ValidationError', () => {
      const validationError = new ValidationError('Validation failed');
      const regularError = new Error('Regular error');

      expect(ErrorHandler.isValidationError(validationError)).toBe(true);
      expect(ErrorHandler.isValidationError(regularError)).toBe(false);
    });

    it('should detect NotFoundError', () => {
      const notFoundError = new NotFoundError('Not found');
      const regularError = new Error('Regular error');

      expect(ErrorHandler.isNotFoundError(notFoundError)).toBe(true);
      expect(ErrorHandler.isNotFoundError(regularError)).toBe(false);
    });
  });

  describe('Retry Logic', () => {
    it('should recommend retry for NetworkError', () => {
      const networkError = new NetworkError('Network failed');
      expect(ErrorHandler.shouldRetry(networkError)).toBe(true);
    });

    it('should recommend retry for AppError with retryable codes', () => {
      const retryableError = new AppError('NETWORK_ERROR', 'Network failed');
      const timeoutError = new AppError('TIMEOUT_ERROR', 'Request timeout');
      const validationError = new AppError('VALIDATION_ERROR', 'Invalid input');

      expect(ErrorHandler.shouldRetry(retryableError)).toBe(true);
      expect(ErrorHandler.shouldRetry(timeoutError)).toBe(true);
      expect(ErrorHandler.shouldRetry(validationError)).toBe(false);
    });

    it('should not recommend retry for non-retryable errors', () => {
      const validationError = new ValidationError('Invalid input');
      const authError = new AuthenticationError('Auth failed');
      const regularError = new Error('Regular error');

      expect(ErrorHandler.shouldRetry(validationError)).toBe(false);
      expect(ErrorHandler.shouldRetry(authError)).toBe(false);
      expect(ErrorHandler.shouldRetry(regularError)).toBe(false);
    });
  });
});

describe('Error Inheritance', () => {
  it('should maintain error inheritance chain', () => {
    const appError = new AppError('TEST_ERROR', 'Test message');
    const networkError = new NetworkError('Network failed');

    expect(appError instanceof Error).toBe(true);
    expect(appError instanceof AppError).toBe(true);
    expect(networkError instanceof Error).toBe(true);
    expect(networkError instanceof AppError).toBe(true);
    expect(networkError instanceof NetworkError).toBe(true);
  });

  it('should preserve stack trace', () => {
    const appError = new AppError('TEST_ERROR', 'Test message');
    expect(appError.stack).toBeDefined();
    expect(appError.stack).toContain('AppError');
  });
});

describe('Error Serialization', () => {
  it('should serialize AppError correctly', () => {
    const appError = new AppError('TEST_ERROR', 'Test message', { field: 'name' });
    const serialized = JSON.stringify(appError);
    const parsed = JSON.parse(serialized);

    // Error serialization includes message and name
    expect(parsed.message).toBe('Test message');
    expect(parsed.name).toBe('AppError');
    expect(parsed.code).toBe('TEST_ERROR');
  });

  it('should handle circular references in details', () => {
    const circularObj: any = { name: 'test' };
    circularObj.self = circularObj;

    const appError = new AppError('TEST_ERROR', 'Test message', circularObj);
    const apiError = ErrorHandler.createApiError(appError);

    expect(apiError.code).toBe('TEST_ERROR');
    expect(apiError.message).toBe('Test message');
    expect(apiError.details).toBeDefined();
  });
});

describe('Error Context', () => {
  it('should preserve original error context', () => {
    const originalError = new Error('Original error');
    originalError.stack = 'Original stack trace';
    
    const appError = new AppError('TEST_ERROR', 'Wrapped error', undefined, originalError);
    const apiError = ErrorHandler.createApiError(appError);

    // AppError details should be preserved
    expect(apiError.code).toBe('TEST_ERROR');
    expect(apiError.message).toBe('Wrapped error');
    expect(apiError.details).toBeUndefined();
  });

  it('should handle errors with additional properties', () => {
    const error = new Error('Test error');
    (error as any).statusCode = 404;
    (error as any).response = { data: 'Not found' };

    const apiError = ErrorHandler.createApiError(error);

    expect(apiError.details).toHaveProperty('stack');
    expect(apiError.details).toHaveProperty('statusCode', 404);
    expect(apiError.details).toHaveProperty('response');
    expect(apiError.details.response).toEqual({ data: 'Not found' });
  });
});

describe('Error Aggregation', () => {
  it('should handle multiple errors', () => {
    const errors = [
      new ValidationError('Invalid email'),
      new ValidationError('Invalid password'),
    ];

    const apiErrors = errors.map(ErrorHandler.createApiError);

    expect(apiErrors).toHaveLength(2);
    expect(apiErrors[0].code).toBe('VALIDATION_ERROR');
    expect(apiErrors[1].code).toBe('VALIDATION_ERROR');
  });

  it('should handle mixed error types', () => {
    const errors = [
      new NetworkError('Network failed'),
      new ValidationError('Invalid input'),
      new Error('Unknown error'),
    ];

    const apiErrors = errors.map(ErrorHandler.createApiError);

    expect(apiErrors[0].code).toBe('NETWORK_ERROR');
    expect(apiErrors[1].code).toBe('VALIDATION_ERROR');
    expect(apiErrors[2].code).toBe('UNKNOWN_ERROR');
  });
});
