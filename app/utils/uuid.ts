/**
 * Generate a unique ID using crypto.randomUUID() with fallback for environments
 * that don't support it (e.g., older browsers or non-secure contexts).
 *
 * @returns A unique identifier string (UUID v4 format)
 */
export function generateUniqueId(): string {
  // Check if crypto.randomUUID is available (modern browsers, Node.js 14.17.0+)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback: Generate a UUID v4-like string manually
  // This implementation follows the UUID v4 specification (RFC 4122)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
