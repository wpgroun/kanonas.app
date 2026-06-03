// ─── CORE ───────────────────────────────────────────────────────────────────
export { TEMP_TEMPLE_ID } from '@/lib/constants'
export { getCurrentTempleId, seedDummyTemple } from '@/actions/core'

// ─── AUTH ────────────────────────────────────────────────────────────────────
export { loginAction, logoutAction, forgotPasswordAction, resetPasswordAction } from '@/actions/auth'

// ─── PARISHIONERS ────────────────────────────────────────────────────────────
export {
 getParishioners,
 createParishioner,
 getParishionerDetails,
 updateParishionerDetails,
 updateParishionerRoles,
} from '@/actions/parishioners'

// ─── SACRAMENTS / TOKENS ─────────────────────────────────────────────────────
export {
 createSacramentRequest,
 getPendingRequests,
 getTokens,
 getRequestDetails,
 linkPersonToSacrament,
 markTokenAsDocsGenerated,
 verifyTokenByHash,
 savePublicTokenAnswers,
 sendFormLinkAction,
} from '@/actions/sacraments'

// ─── FINANCES ────────────────────────────────────────────────────────────────
export {
 createDonation,
 getDonations,
 getDonationStats,
 addExpense,
} from '@/actions/finances'

// ─── PHILANTHROPY ────────────────────────────────────────────────────────────
export {
 getBeneficiaries,
 createBeneficiary,
 getParishionerBeneficiary,
 getPhilanthropyStats,
 getInventoryItems,
} from '@/actions/philanthropy'

// ─── DOCUMENTS / TEMPLATES ───────────────────────────────────────────────────
export { getDocTemplates, saveDocTemplate } from '@/actions/documents'

// ─── DIPTYCHS ────────────────────────────────────────────────────────────────
export {
 getDiptychs,
 addDiptychNames,
 toggleDiptychActive,
 editDiptychName,
 deleteDiptychName,
 clearDiptychs,
} from '@/actions/diptychs'

// ─── PROTOCOL ────────────────────────────────────────────────────────────────
export { getProtocols, addProtocolEntry } from '@/actions/protocol'

// ─── SCHEDULE ────────────────────────────────────────────────────────────────
export {
 getServiceSchedules,
 addServiceSchedule,
 deleteServiceSchedule,
} from '@/actions/schedule'

// ─── ASSETS ──────────────────────────────────────────────────────────────────
export { getAssets, addAsset, updateAssetStatus, deleteAsset } from '@/actions/assets'

// ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────
export { upsertAssignment } from '@/actions/assignments'

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export { getTempleSettings, saveTempleSettings } from '@/actions/settings'

// ─── ADMIN ───────────────────────────────────────────────────────────────────
export { getAllTemples, createRole, updateRolePermissions } from '@/actions/admin'
