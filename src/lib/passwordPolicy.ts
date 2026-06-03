/**
 * Kanonas — Password Policy
 *
 * Centralised password validation used across the entire platform.
 * Single source of truth for policy rules — change here to affect all forms.
 */

export const PASSWORD_POLICY = {
 minLength: 10,
 requireUppercase: false, // Keep UX friendly for priests
 requireNumber: false,
 requireSpecial: false,
} as const

/**
 * Validate a password against the policy.
 * Returns { valid: true } or { valid: false, message: '...' }
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
 if (!password || password.length < PASSWORD_POLICY.minLength) {
 return {
 valid: false,
 message: `Ο κωδικός πρέπει να έχει τουλάχιστον ${PASSWORD_POLICY.minLength} χαρακτήρες.`
 }
 }
 return { valid: true }
}

/** Human-readable description of the policy — shown in forms */
export const PASSWORD_POLICY_HINT = `Τουλάχιστον ${PASSWORD_POLICY.minLength} χαρακτήρες`
