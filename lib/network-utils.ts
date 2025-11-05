/**
 * Network utilities for handling transient errors and retries
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    '500', // Internal Server Error
    '502', // Bad Gateway
    '503', // Service Unavailable
    '504', // Gateway Timeout
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'Internal server error',
    'Cloudflare',
  ],
};

/**
 * Check if an error is retryable (transient network/server error)
 */
export function isRetryableError(error: any, retryableErrors: string[]): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  
  // Check if error message contains any retryable error indicators
  return retryableErrors.some(indicator => 
    errorMessage.toLowerCase().includes(indicator.toLowerCase())
  );
}

/**
 * Execute a function with exponential backoff retry
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's not a retryable error
      if (!isRetryableError(error, opts.retryableErrors)) {
        throw error;
      }
      
      // Don't retry if we've exhausted attempts
      if (attempt === opts.maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelay
      );
      
      if (__DEV__) {
        console.log(`[withRetry] Attempt ${attempt + 1}/${opts.maxRetries + 1} failed, retrying in ${delay}ms...`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Create a user-friendly error message from a backend error
 */
export function formatBackendError(error: any): string {
  if (!error) return 'An unknown error occurred';
  
  const errorMessage = error.message || error.toString();
  
  // Check for common backend errors and provide user-friendly messages
  if (errorMessage.includes('500') || errorMessage.includes('Internal server error')) {
    return 'The server is temporarily unavailable. Please try again in a moment.';
  }
  
  if (errorMessage.includes('502') || errorMessage.includes('Bad Gateway')) {
    return 'Connection to server failed. Please check your internet connection.';
  }
  
  if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
    return 'The service is temporarily unavailable. Please try again later.';
  }
  
  if (errorMessage.includes('504') || errorMessage.includes('Gateway Timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  if (errorMessage.includes('Cloudflare')) {
    return 'Network error occurred. Please try again in a moment.';
  }
  
  if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  // Return original error message if we don't recognize it
  return errorMessage;
}

/**
 * Check if we should silently fail (for background operations)
 */
export function shouldSilentlyFail(error: any): boolean {
  return isRetryableError(error, DEFAULT_RETRY_OPTIONS.retryableErrors);
}

