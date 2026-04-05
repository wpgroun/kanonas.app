/**
 * Kanonas — Subscription Plan Feature Matrix
 *
 * Defines which features are available per subscription tier.
 * Used for server-side feature gating in page.tsx files.
 *
 * How to gate a feature:
 * const features = await getTempleFeatures(session.templeId)
 * if (!features.philanthropy) return <UpgradeGate feature="philanthropy"/>
 */

import { prisma } from '@/lib/prisma'

// ─── Feature Flags ─────────────────────────────────────────────────────────────

export interface TempleFeatures {
 /** Core registry & sacraments */
 parishioners: boolean
 sacraments: boolean
 diptychs: boolean
 schedule: boolean
 protocol: boolean
 /** Financial modules */
 basicFinances: boolean
 advancedFinances: boolean // budget, BI charts, quarterly taxes
 /** Community & Social */
 philanthropy: boolean // beneficiaries, philoptochos distribution
 bloodbank: boolean // blood donor registry
 youth: boolean // youth programs, camps
 assignments: boolean // clergy assignments
 ministries: boolean // volunteer ministries
 /** Operations */
 kanban: boolean // task board
 assets: boolean // asset/property management
 vault: boolean // document vault
 documentGeneration: boolean // PDF/DOCX certificate generation
 /** Communication */
 bulkEmail: boolean // mass email to parishioners
 mailing: boolean // postal labels (always free)
 /** Export & Import */
 exportData: boolean
 importData: boolean
}

// ─── Tier Definitions ──────────────────────────────────────────────────────────

const FREE_FEATURES: TempleFeatures = {
 parishioners: true,
 sacraments: true,
 diptychs: true,
 schedule: true,
 protocol: true,
 basicFinances: true,
 advancedFinances: false,
 philanthropy: false,
 bloodbank: false,
 youth: false,
 assignments: false,
 ministries: false,
 kanban: true,
 assets: false,
 vault: false,
 documentGeneration: false,
 bulkEmail: false,
 mailing: true,
 exportData: true,
 importData: false,
}

const PREMIUM_FEATURES: TempleFeatures = {
 parishioners: true,
 sacraments: true,
 diptychs: true,
 schedule: true,
 protocol: true,
 basicFinances: true,
 advancedFinances: true,
 philanthropy: true,
 bloodbank: true,
 youth: true,
 assignments: true,
 ministries: true,
 kanban: true,
 assets: true,
 vault: true,
 documentGeneration: true,
 bulkEmail: true,
 mailing: true,
 exportData: true,
 importData: true,
}

const METROPOLIS_FEATURES: TempleFeatures = {
 ...PREMIUM_FEATURES,
}

// ─── Server-Side Helper ─────────────────────────────────────────────────────────

/**
 * Returns the feature flags for a given temple based on its active subscription.
 * Falls back to FREE_FEATURES if no active subscription is found.
 */
export async function getTempleFeatures(templeId: string): Promise<TempleFeatures> {
 if (!templeId) return FREE_FEATURES

 const sub = await prisma.subscription.findFirst({
 where: {
 templeId,
 status: 'active',
 },
 include: { plan: true },
 })

 // No subscription → free tier
 if (!sub || !sub.plan) return FREE_FEATURES

 // Subscription is expired
 if (sub.expiresAt && sub.expiresAt < new Date()) return FREE_FEATURES

 // Metropolis plan → all features
 if (sub.plan.isMetropolis) return METROPOLIS_FEATURES

 // Any other active paid plan → premium
 return PREMIUM_FEATURES
}

/**
 * Human-readable plan name for display in UpgradeGate.
 */
export function getTierName(features: TempleFeatures): string {
 if (features.philanthropy && features.advancedFinances) {
 return 'Premium'
 }
 return 'Δωρεάν'
}
