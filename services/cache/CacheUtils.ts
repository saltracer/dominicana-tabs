/**
 * Cache Utility Functions
 */

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get file extension from URL
 */
export function getFileExtension(url: string): string {
  const urlParts = url.split('?')[0].split('.');
  return urlParts[urlParts.length - 1] || 'jpg';
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
}

/**
 * Extract Supabase storage path from URL
 */
export function extractStoragePath(url: string): string {
  if (url.includes('/storage/v1/object/')) {
    const parts = url.split('/storage/v1/object/');
    if (parts.length > 1) {
      const pathParts = parts[1].split('/');
      if (pathParts.length > 2) {
        return pathParts.slice(2).join('/');
      }
    }
  }
  return '';
}

