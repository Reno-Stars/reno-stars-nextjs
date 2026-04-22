import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure share token for invoice URLs.
 * Returns a 64-character hex string (32 bytes).
 */
export function generateShareToken(): string {
  return randomBytes(32).toString('hex');
}
