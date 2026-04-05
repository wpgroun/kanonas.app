'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * Generate a new TOTP secret for the user and return the provisioning URI
 * for use with Google Authenticator / Authy / etc.
 */
export async function setupTOTP() {
  const session = await requireAuth()
  
  // Generate a random 20-byte secret encoded as base32
  const crypto = await import('crypto')
  const secret = crypto.randomBytes(20).toString('hex').slice(0, 20).toUpperCase()
  
  // Base32 encode (simple)
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let base32Secret = ''
  for (let i = 0; i < secret.length; i += 5) {
    const chunk = secret.slice(i, i + 5)
    for (const ch of chunk) {
      base32Secret += base32Chars[ch.charCodeAt(0) % 32]
    }
  }
  
  // Store the secret (not yet enabled until verified)
  await (prisma.user as any).update({
    where: { id: session.userId },
    data: { totpSecret: base32Secret }
  })

  // Build otpauth URI
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const issuer = 'Kanonas'
  const account = user?.email || 'user'
  const otpauthUrl = `otpauth://totp/${issuer}:${account}?secret=${base32Secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`

  return { success: true, secret: base32Secret, otpauthUrl }
}

/**
 * Verify a TOTP code and enable 2FA if valid.
 */
export async function verifyAndEnableTOTP(code: string) {
  const session = await requireAuth()
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  
  if (!(user as any)?.totpSecret) {
    return { success: false, error: 'Δεν έχει ρυθμιστεί TOTP secret.' }
  }

  const isValid = verifyTOTPCode((user as any).totpSecret, code)
  
  if (!isValid) {
    return { success: false, error: 'Λανθασμένος κωδικός. Δοκιμάστε ξανά.' }
  }

  await (prisma.user as any).update({
    where: { id: session.userId },
    data: { twoFactorEnabled: true }
  })

  return { success: true }
}

/**
 * Disable 2FA for the current user
 */
export async function disableTOTP() {
  const session = await requireAuth()
  await (prisma.user as any).update({
    where: { id: session.userId },
    data: { twoFactorEnabled: false, totpSecret: null }
  })
  return { success: true }
}

/**
 * Verify a TOTP code during login
 */
export function verifyTOTPCode(secret: string, code: string): boolean {
  const crypto = require('crypto')
  
  // Current time step (30-second window)
  const timeStep = Math.floor(Date.now() / 1000 / 30)
  
  // Check current and ±1 time steps for clock drift
  for (let i = -1; i <= 1; i++) {
    const step = timeStep + i
    const buffer = Buffer.alloc(8)
    buffer.writeUInt32BE(0, 0)
    buffer.writeUInt32BE(step, 4)
    
    // Decode base32 secret to bytes
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = ''
    for (const ch of secret.toUpperCase()) {
      const val = base32Chars.indexOf(ch)
      if (val === -1) continue
      bits += val.toString(2).padStart(5, '0')
    }
    const keyBytes = Buffer.alloc(Math.floor(bits.length / 8))
    for (let j = 0; j < keyBytes.length; j++) {
      keyBytes[j] = parseInt(bits.slice(j * 8, (j + 1) * 8), 2)
    }
    
    const hmac = crypto.createHmac('sha1', keyBytes)
    hmac.update(buffer)
    const hash = hmac.digest()
    
    const offset = hash[hash.length - 1] & 0xf
    const binary = ((hash[offset] & 0x7f) << 24) |
                   ((hash[offset + 1] & 0xff) << 16) |
                   ((hash[offset + 2] & 0xff) << 8) |
                   (hash[offset + 3] & 0xff)
    
    const otp = (binary % 1000000).toString().padStart(6, '0')
    
    if (otp === code) return true
  }
  
  return false
}
