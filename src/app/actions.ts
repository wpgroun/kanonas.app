/**
 * BACKWARD-COMPATIBLE BARREL RE-EXPORT
 * 
 * This file re-exports everything from the new domain-based action modules in 
 * src/actions/. All existing imports throughout the codebase continue to work
 * without modification.
 * 
 * For new code, prefer importing directly from the domain module:
 *   import { createDonation } from '@/actions/finances'
 * 
 * instead of the legacy path:
 *   import { createDonation } from '../actions'
 */
'use server'

export * from '@/actions/index'

