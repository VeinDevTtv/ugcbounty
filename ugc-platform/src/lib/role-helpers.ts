/**
 * Client-safe role helper functions
 * These are pure functions that can be used in both client and server contexts
 */

export type UserRole = 'creator' | 'business' | null

/**
 * Check if user is a creator
 * @param role User role string or null
 * @returns True if role is 'creator'
 */
export function isCreator(role: string | null): boolean {
  return role === 'creator'
}

/**
 * Check if user is a business
 * @param role User role string or null
 * @returns True if role is 'business'
 */
export function isBusiness(role: string | null): boolean {
  return role === 'business'
}

/**
 * Check if user has selected a role
 * @param role User role string or null
 * @returns True if role is not null
 */
export function hasRole(role: string | null): boolean {
  return role === 'creator' || role === 'business'
}

