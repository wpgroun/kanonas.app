import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * ONE-TIME setup endpoint — PROTECTED by SETUP_SECRET env variable.
 *
 * Usage:
 * curl -H"x-setup-secret: <SETUP_SECRET>"https://your-domain.com/api/setup
 *
 * This endpoint is completely disabled in production unless SETUP_SECRET is defined.
 * It will also refuse to re-run if the admin user already exists.
 */
export async function GET(req: NextRequest) {
 // 1. Guard: require SETUP_SECRET header
 const setupSecret = process.env.SETUP_SECRET;
 if (!setupSecret) {
 return NextResponse.json(
 { error: 'Setup endpoint is disabled. Set SETUP_SECRET env variable to enable it.' },
 { status: 403 }
);
 }

 const providedSecret = req.headers.get('x-setup-secret');
 if (providedSecret !== setupSecret) {
 return NextResponse.json({ error: 'Forbidden: Invalid setup secret.' }, { status: 403 });
 }

 // 2. Guard: prevent re-running if admin already exists
 const existing = await prisma.user.findUnique({ where: { email: 'admin@kanonas.gr' } });
 if (existing) {
 return NextResponse.json(
 { message: 'Setup already completed. Admin user already exists. Delete SETUP_SECRET to fully disable this endpoint.' },
 { status: 409 }
);
 }

 // 3. Require the initial admin password to be passed — no hardcoded passwords
 const initialPassword = req.nextUrl.searchParams.get('password');
 if (!initialPassword || initialPassword.length < 12) {
 return NextResponse.json(
 { error: 'Pass a strong ?password= query param (min 12 chars) to set the admin password.' },
 { status: 400 }
);
 }

 try {
 // 4. Create Metropolis & Temple
 let metropolis = await prisma.metropolis.findFirst({
 where: { name: 'Ιερά Μητρόπολη Αθηνών' }
 });
 if (!metropolis) {
 metropolis = await prisma.metropolis.create({
 data: { name: 'Ιερά Μητρόπολη Αθηνών' }
 });
 }

 const temple = await prisma.temple.upsert({
 where: { id: 'cm0testtempleid0000000001' },
 update: {},
 create: {
 id: 'cm0testtempleid0000000001',
 name: 'Ιερός Ναός Αγίου Ελευθερίου',
 metropolisId: metropolis.id,
 email: 'info@agios-eleftherios.gr'
 }
 });

 // 5. Create Default Roles (skip duplicates)
 const roleDefs = [
 { name: 'Εφημέριος', canViewFinances: false, canEditFinances: false, canManageRequests: true, canManageRegistry: true, canManageSchedule: true, canManageAssets: false },
 { name: 'Γραμματεία', canViewFinances: false, canEditFinances: false, canManageRequests: true, canManageRegistry: true, canManageSchedule: true, canManageAssets: false },
 { name: 'Συμβούλιο / Ταμίας', canViewFinances: true, canEditFinances: true, canManageRequests: false, canManageRegistry: false, canManageSchedule: false, canManageAssets: true },
 ];
 for (const roleDef of roleDefs) {
 await prisma.role.upsert({
 where: { templeId_name: { templeId: temple.id, name: roleDef.name } },
 update: {},
 create: { templeId: temple.id, ...roleDef }
 });
 }

 // 6. Create the Head Priest (Admin) with the provided password
 const passwordHash = await bcrypt.hash(initialPassword, 12);
 const user = await prisma.user.create({
 data: {
 email: 'admin@kanonas.gr',
 passwordHash,
 firstName: 'Ιωάννης',
 lastName: 'Παππάς',
 isSuperAdmin: false,
 temples: {
 create: {
 templeId: temple.id,
 isHeadPriest: true
 }
 }
 },
 select: { id: true, email: true, firstName: true, lastName: true }
 });

 return NextResponse.json({
 message: 'Setup Complete. Delete or unset SETUP_SECRET to disable this endpoint.',
 user
 });

 } catch (err: any) {
 console.error('[Setup] Error:', err);
 return NextResponse.json({ error: 'Setup failed. Check server logs.' }, { status: 500 });
 }
}
