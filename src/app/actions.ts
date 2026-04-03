'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/auth'

export async function loginAction(email: string, passwordPlain: string) {
  try {
    // We ignore type checking here because the prisma client might not have regenerated completely due to windows locks
    // @ts-ignore
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return { success: false, error: 'Λάθος στοιχεία (χρήστης δεν βρέθηκε)' };
    }
    
    // Check password
    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isValid) return { success: false, error: 'Λάθος κωδικός πρόσβασης' };

    // Find UserTemple relation for roles
    // @ts-ignore
    const userTemple: any = await prisma.userTemple.findFirst({
      where: { userId: user.id },
      include: { role: true }
    });

    const sessionPayload = {
      userId: user.id,
      templeId: userTemple?.templeId || TEMP_TEMPLE_ID,
      isSuperAdmin: user.isSuperAdmin,
      isHeadPriest: userTemple?.isHeadPriest || false,
      canViewFinances: userTemple?.role?.canViewFinances || userTemple?.isHeadPriest || false,
      canEditFinances: userTemple?.role?.canEditFinances || userTemple?.isHeadPriest || false,
      roleName: userTemple?.role?.name || (userTemple?.isHeadPriest ? 'Προϊστάμενος' : 'User')
    };

    const token = await encrypt(sessionPayload);

    (await cookies()).set('Kanonas_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return { success: true };
  } catch(e: any) {
    return { success: false, error: e?.message || 'Σφάλμα σύνδεσης' }
  }
}

export async function logoutAction() {
  (await cookies()).delete('Kanonas_auth');
  return { success: true };
}

// Ένα προσωρινό ID Ναού για το MVP μας, μέχρι να προστεθεί Σύστημα Σύνδεσης (Login)
import { getSession } from '@/lib/auth';

const TEMP_TEMPLE_ID = "cm0testtempleid0000000001";

async function getCurrentTempleId() {
  const session = await getSession();
  if (session?.templeId) return session.templeId;
  return TEMP_TEMPLE_ID; // Fallback for dev 
}

// Συνάρτηση που εξασφαλίζει ότι ο ναός υπάρχει στη βάση (έχει λειτουργία Seeder)
export async function seedDummyTemple() {
  try {
    const existing = await prisma.temple.findUnique({ where: { id: TEMP_TEMPLE_ID } });
    if (!existing) {
      await prisma.temple.create({
        data: {
          id: TEMP_TEMPLE_ID,
          name: "Ιερός Ναός Αγίου Δημητρίου (Δοκιμαστικός)",
          city: "Αθήνα"
        }
      });
    }
  } catch (e) {
    console.error("Η βάση δεν έχει συγχρονιστεί ακόμα.", e);
  }
}

// Μέθοδος που δέχεται τα δεδομένα από το G2C Γραφικό Περιβάλλον (book/page.tsx)
export async function createSacramentRequest(formData: {
  type: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  metaStr?: string; // New parameter that gets stringified JSON answers
}) {
  await seedDummyTemple();
  
  // Δημιουργούμε έναν τυχαίο μοναδικό κωδικό για το link που θα σταλεί στο ζευγάρι!
  const randomHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  try {
    const token = await prisma.token.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        tokenStr: randomHash,
        serviceType: formData.type,
        status: "pending",
        customerName: formData.name,
        customerEmail: formData.email,
        ceremonyDate: new Date(formData.date),
        ...(formData.metaStr ? {
          ceremonyMeta: {
            create: {
              dataJson: formData.metaStr
            }
          }
        } : {})
      }
    });

    // Αυτή η εντολή δίνει οδηγία στο Next.js να ανανεώσει αμέσως τη σελίδα του Ιερέα!
    revalidatePath('/admin/requests');
    
    return { success: true, tokenId: token.id, hash: randomHash };
  } catch (error) {
    console.error("Σφάλμα αποθήκευσης:", error);
    return { success: false, error: "Αποτυχία ολοκλήρωσης" };
  }
}

// Διάβασμα των εκκρεμών αιτήσεων για την εμφάνισή τους στο B2B Dashboard
export async function getPendingRequests() {
  try {
    return await prisma.token.findMany({
      where: {
        templeId: TEMP_TEMPLE_ID,
        status: "pending"
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch(e) {
    return [];
  }
}

// Διαβάζει όλους τους Ενορίτες ενός Ναού
export async function getParishioners() {
  try {
    return await prisma.parishioner.findMany({
      where: {
        templeId: TEMP_TEMPLE_ID,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch(e) {
    return [];
  }
}

// Προσθέτει έναν νέο Ενορίτη
export async function createParishioner(formData: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  fathersName?: string;
  address?: string;
  city?: string;
  afm?: string;
}) {
  await seedDummyTemple();
  
  try {
    const p = await prisma.parishioner.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || null,
        phone: formData.phone || null,
        fathersName: formData.fathersName || null,
        address: formData.address || null,
        city: formData.city || null,
        afm: formData.afm || null,
        status: "active"
      }
    });

    // Ανανέωση της λίστας
    revalidatePath('/admin/parishioners');
    
    return { success: true, id: p.id };
  } catch (error) {
    console.error("Σφάλμα δημιουργίας ενορίτη:", error);
    return { success: false, error: "Αποτυχία ολοκλήρωσης" };
  }
}

// Όλα τα Tokens / Μυστήρια
export async function getTokens() {
  await seedDummyTemple();
  try {
    return await prisma.token.findMany({
      where: { templeId: TEMP_TEMPLE_ID },
      orderBy: { createdAt: 'desc' }
    });
  } catch(e) {
    return [];
  }
}

// Λεπτομέρειες Ενορίτη (Βασικά στοιχεία, ρόλοι, ιστορικό μυστηρίων)
export async function getParishionerDetails(id: string) {
  try {
    return await prisma.parishioner.findUnique({
      where: { id: id },
      include: {
        donations: { orderBy: { date: 'desc' } },
        ceremonyPersons: {
          include: {
            token: true // Φέρνει και τα στοιχεία του Μυστηρίου (Ημερομηνία, Είδος)
          }
        }
      }
    });
  } catch(e) {
    return null;
  }
}

// Ενημέρωση ρόλων/ιδιοτήτων (tags) ενός Ενορίτη
export async function updateParishionerRoles(id: string, newRolesStr: string) {
  try {
    await prisma.parishioner.update({
      where: { id: id },
      data: {
        roles: newRolesStr // Το περιμένουμε ως JSON string, π.χ. '["Συσσίτιο", "Επίτροπος"]'
      }
    });
    revalidatePath(`/admin/parishioners/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Σφάλμα ενημέρωσης ρόλων:", error);
    return { success: false, error: "Αποτυχία ενημέρωσης" };
  }
}

// Διαβάζει τα στοιχεία ενός Μυστηρίου/Αιτήματος (Token) & τα συνδεδεμένα πρόσωπα
export async function getRequestDetails(tokenId: string) {
  try {
    return await prisma.token.findUnique({
      where: { id: tokenId },
      include: {
        persons: {
          include: { parishioner: true } // Φέρνει και τα στοιχεία του ενορίτη (όνομα στο μητρώο κλπ)
        },
        ceremonyMeta: true
      }
    });
  } catch(e) {
    return null;
  }
}

// Συνδέει έναν Ενορίτη με ένα Μυστήριο (π.χ. ως Κουμπάρο)
export async function linkPersonToSacrament(tokenId: string, parishionerId: string, role: string) {
  try {
    // Διαβάζουμε το όνομα του ενορίτη για να το κάνουμε snapshot (για μελλοντική εκτύπωση εγγράφων βάσει νόμου)
    const p = await prisma.parishioner.findUnique({ where: { id: parishionerId }});
    if (!p) return { success: false, error: "Ο ενορίτης δεν βρέθηκε στο Μητρώο." };

    await prisma.ceremonyPerson.create({
      data: {
        tokenId: tokenId,
        parishionerId: parishionerId,
        role: role,
        firstName: p.firstName,
        lastName: p.lastName,
        fathersName: p.fathersName,
        mothersName: p.mothersName
      }
    });
    
    revalidatePath(`/admin/requests/${tokenId}`);
    return { success: true };
  } catch (error) {
    console.error("Σφάλμα σύνδεσης προσώπου:", error);
    return { success: false, error: "Αποτυχία σύνδεσης" };
  }
}

// Επιστρέφει τα πρότυπα εγγράφων του Ναού
export async function getDocTemplates(docType?: string) {
  try {
    return await prisma.docTemplate.findMany({
      where: {
        templeId: TEMP_TEMPLE_ID,
        ...(docType ? { docType } : {})
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch(e) { return []; }
}

// Αποθήκευση/Ενημέρωση Προτύπου
export async function saveDocTemplate(id: string | null, docType: string, nameEl: string, htmlContent: string) {
  await seedDummyTemple();
  try {
    if (id) {
      await prisma.docTemplate.update({
        where: { id },
        data: { docType, nameEl, htmlContent }
      });
    } else {
      await prisma.docTemplate.create({
        data: {
          templeId: TEMP_TEMPLE_ID,
          docType,
          nameEl,
          htmlContent
        }
      });
    }
    revalidatePath('/admin/settings/templates');
    return { success: true };
  } catch(e) {
    console.error(e);
    return { success: false };
  }
}

// --------------------------------------------------------------------------
// ΟΙΚΟΝΟΜΙΚΑ (FINANCES / DONATIONS)
// --------------------------------------------------------------------------

// Δημιουργία νέας Ταμειακής Κίνησης (Δωρεά, Παγκάρι, κλπ)
export async function createDonation(data: {
  amount: number;
  purpose: string;
  receiptNumber?: string;
  parishionerId?: string; // Αν είναι null -> Ανώνυμο έσοδο
}) {
  await seedDummyTemple();
  try {
    const donation = await prisma.donation.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        amount: data.amount,
        purpose: data.purpose,
        receiptNumber: data.receiptNumber,
        parishionerId: data.parishionerId || null,
        donorName: data.parishionerId ? undefined : 'Ανώνυμο / Γενικό Έσοδο',
      }
    });
    revalidatePath('/admin/finances');
    if (data.parishionerId) revalidatePath(`/admin/parishioners/${data.parishionerId}`);
    return { success: true, donation };
  } catch(error) {
    console.error("Σφάλμα δημιουργίας εσόδου:", error);
    return { success: false, error: "Αποτυχία καταχώρησης εσόδου." };
  }
}

// Λήψη Ιστορικού Ταμείου
export async function getDonations() {
  await seedDummyTemple();
  try {
    return await prisma.donation.findMany({
      where: { templeId: TEMP_TEMPLE_ID },
      orderBy: { date: 'desc' },
      include: {
        parishioner: {
          select: { firstName: true, lastName: true }
        }
      }
    });
  } catch (error) {
    return [];
  }
}

// --------------------------------------------------------------------------
// PROFILES & SISSITIO/PHILANTHROPY
// --------------------------------------------------------------------------

// Ενημέρωση βασικών στοιχείων Ενορίτη
export async function updateParishionerDetails(id: string, data: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  afm?: string;
  idNumber?: string;
}) {
  try {
    await prisma.parishioner.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        afm: data.afm || null,
        idNumber: data.idNumber || null,
      }
    });
    revalidatePath(`/admin/parishioners/${id}`);
    revalidatePath('/admin/parishioners');
    return { success: true };
  } catch (error) {
    console.error("Σφάλμα ενημέρωσης ενορίτη:", error);
    return { success: false, error: "Αποτυχία ενημέρωσης" };
  }
}

// Διαβάζει αν ο Ενορίτης είναι Εγγεγραμμένος στο Φιλόπτωχο/Συσσίτιο
export async function getParishionerBeneficiary(parishionerId: string) {
  try {
    return await prisma.beneficiary.findUnique({
      where: { parishionerId },
      include: {
        assistances: { orderBy: { dateGiven: 'desc' }, take: 20 }
      }
    });
  } catch (e) {
    return null;
  }
}

// Όλοι οι Ωφελούμενοι
export async function getBeneficiaries() {
  await seedDummyTemple();
  try {
    return await prisma.beneficiary.findMany({
      where: { templeId: TEMP_TEMPLE_ID },
      orderBy: { createdAt: 'desc' },
      include: {
        parishioner: { select: { firstName: true, lastName: true } }
      }
    });
  } catch(e) {
    return [];
  }
}

// Δημιουργία Ωφελούμενου
export async function createBeneficiary(data: {
  firstName: string;
  lastName: string;
  address?: string;
  phone?: string;
  portions: number;
  parishionerId?: string;
}) {
  await seedDummyTemple();
  try {
    await prisma.beneficiary.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address || null,
        phone: data.phone || null,
        portions: data.portions || 1,
        parishionerId: data.parishionerId || null
      }
    });
    revalidatePath('/admin/philanthropy');
    if (data.parishionerId) revalidatePath(`/admin/parishioners/${data.parishionerId}`);
    return { success: true };
  } catch(e) {
    console.error(e);
    return { success: false, error: "Σφάλμα δημιουργίας" };
  }
}

// Στατιστικά Dashboard
export async function getPhilanthropyStats() {
  await seedDummyTemple();
  try {
    const total = await prisma.beneficiary.count({ where: { templeId: TEMP_TEMPLE_ID, status: 'active' } });
    
    const beneficiaries = await prisma.beneficiary.findMany({
      where: { templeId: TEMP_TEMPLE_ID, status: 'active' },
      select: { portions: true }
    });
    
    const portionsPerDay = beneficiaries.reduce((sum: number, b: any) => sum + b.portions, 0);
    const portions30Days = portionsPerDay * 30;
    
    const cost30Days = portions30Days * 2.50; // Demo cost calculation
    
    return {
      activeBeneficiaries: total,
      portions30Days,
      cost30Days,
      monthGrowth: '+5%'
    };
  } catch(e) {
    return { activeBeneficiaries: 0, portions30Days: 0, cost30Days: 0, monthGrowth: '0%' };
  }
}

// Διαβάζει το Αποθεματικό
export async function getInventoryItems() {
  await seedDummyTemple();
  try {
    return await prisma.inventoryItem.findMany({
      where: { templeId: TEMP_TEMPLE_ID },
      orderBy: { name: 'asc' }
    });
  } catch(e) {
    return [];
  }
}

// --- GLOBAL SETTINGS & CONFIGURATION ---
export async function getTempleSettings() {
  await seedDummyTemple();
  try {
    const temple = await prisma.temple.findUnique({ where: { id: TEMP_TEMPLE_ID } });
    if (!temple || !temple.settings) return {};
    return JSON.parse(temple.settings);
  } catch(e) {
    return {};
  }
}

export async function saveTempleSettings(settingsObj: any) {
  try {
    await prisma.temple.update({
      where: { id: TEMP_TEMPLE_ID },
      data: { settings: JSON.stringify(settingsObj) }
    });
    revalidatePath('/admin/settings');
    revalidatePath('/admin/requests/[id]/print'); // Refresh document engine cache
    return { success: true };
  } catch(e) {
    return { success: false };
  }
}

// --------------------------------------------------------------------------
// DIPTYCHS (ΔΙΠΤΥΧΑ - ΜΝΗΜΟΝΕΥΣΗ)
// --------------------------------------------------------------------------

export async function getDiptychs() {
  await seedDummyTemple();
  try {
    return await prisma.diptych.findMany({
      where: { templeId: TEMP_TEMPLE_ID, isActive: true },
      orderBy: { createdAt: 'asc' }
    });
  } catch(e) {
    return [];
  }
}

export async function addDiptychNames(type: string, namesStr: string) {
  await seedDummyTemple();
  try {
    const rawNames = namesStr.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length >= 2);
    if (!rawNames.length) return { success: false, error: 'Δεν βρέθηκαν έγκυρα ονόματα' };

    const dataArgs = rawNames.map(name => ({
      templeId: TEMP_TEMPLE_ID,
      type: type,
      name: name,
      isActive: true,
      submittedBy: 'Admin'
    }));

    await prisma.diptych.createMany({
      data: dataArgs
    });

    revalidatePath('/admin/diptychs');
    return { success: true, count: rawNames.length };
  } catch(e) {
    console.error(e);
    return { success: false, error: 'Αποτυχία προσθήκης ονομάτων' };
  }
}

export async function toggleDiptychActive(id: string, newStatus: boolean) {
  try {
    await prisma.diptych.update({
      where: { id },
      data: { isActive: newStatus }
    });
    revalidatePath('/admin/diptychs');
    return { success: true };
  } catch(e) {
    return { success: false };
  }
}

export async function editDiptychName(id: string, newName: string) {
  try {
    await prisma.diptych.update({
      where: { id },
      data: { name: newName }
    });
    revalidatePath('/admin/diptychs');
    return { success: true };
  } catch(e) {
    return { success: false };
  }
}

export async function deleteDiptychName(id: string) {
  try {
    await prisma.diptych.delete({
      where: { id }
    });
    revalidatePath('/admin/diptychs');
    return { success: true };
  } catch(e) {
    return { success: false };
  }
}

export async function clearDiptychs(type: string) {
  try {
    await prisma.diptych.updateMany({
      where: { templeId: TEMP_TEMPLE_ID, type: type, isActive: true },
      data: { isActive: false }
    });
    revalidatePath('/admin/diptychs');
    return { success: true };
  } catch(e) {
    return { success: false };
  }
}

// --------------------------------------------------------------------------
// PROTOCOL (ΠΡΩΤΟΚΟΛΛΟ)
// --------------------------------------------------------------------------

export async function getProtocols() {
  await seedDummyTemple();
  try {
    return await prisma.protocol.findMany({
      where: { templeId: TEMP_TEMPLE_ID },
      orderBy: { date: 'desc' },
      include: {
        temple: { select: { name: true } }
      }
    });
  } catch(e) {
    return [];
  }
}

export async function addProtocolEntry(data: { direction: string, subject: string, sender?: string, receiver?: string, tokenId?: string }) {
  await seedDummyTemple();
  try {
    const year = new Date().getFullYear();
    // Get the max number for this year
    const latest = await prisma.protocol.findFirst({
      where: { templeId: TEMP_TEMPLE_ID, year: year },
      orderBy: { number: 'desc' }
    });
    const nextNumber = latest ? latest.number + 1 : 1;

    const entry = await prisma.protocol.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        number: nextNumber,
        year: year,
        direction: data.direction,
        subject: data.subject,
        sender: data.sender || null,
        receiver: data.receiver || null,
        tokenId: data.tokenId || null
      }
    });

    revalidatePath('/admin/protocol');
    return { success: true, entry };
  } catch(e) {
    console.error(e);
    return { success: false, error: 'Σφάλμα δημιουργίας πρωτοκόλλου' };
  }
}

export async function markTokenAsDocsGenerated(tokenId: string, assignedPriest: string, bookNumber?: string) {
  try {
    await prisma.token.update({
      where: { id: tokenId },
      data: { 
        status: 'docs_generated',
        assignedPriest: assignedPriest,
        ...(bookNumber ? { bookNumber } : {})
      }
    });
    revalidatePath(`/admin/requests/${tokenId}`);
    revalidatePath('/admin/requests');
    return { success: true };
  } catch(e) {
    return { success: false };
  }
}

// Get single Token by hash string (for public verify page)
export async function verifyTokenByHash(tokenStr: string) {
  try {
    const token = await prisma.token.findUnique({
      where: { tokenStr: tokenStr },
      include: {
        temple: { select: { name: true, city: true } },
        persons: true,
        ceremonyMeta: true
      }
    });
    return token;
  } catch(e) {
    return null;
  }
}

// --------------------------------------------------------------------------
// SCHEDULE (ΠΡΟΓΡΑΜΜΑ ΑΚΟΛΟΥΘΙΩΝ)
// --------------------------------------------------------------------------

export async function getServiceSchedules() {
  await seedDummyTemple();
  try {
    return await prisma.serviceSchedule.findMany({
      where: { templeId: TEMP_TEMPLE_ID },
      orderBy: { date: 'asc' }
    });
  } catch(e) {
    return [];
  }
}

export async function addServiceSchedule(data: { date: string, title: string, description?: string, isMajor?: boolean }) {
  await seedDummyTemple();
  try {
    const sDate = new Date(data.date);
    await prisma.serviceSchedule.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        date: sDate,
        title: data.title,
        description: data.description || null,
        isMajor: data.isMajor || false
      }
    });
    revalidatePath('/admin/schedule');
    revalidatePath('/schedule');
    return { success: true };
  } catch(e) {
    return { success: false };
  }
}

export async function deleteServiceSchedule(id: string) {
  try {
    await prisma.serviceSchedule.delete({ where: { id } });
    revalidatePath('/admin/schedule');
    revalidatePath('/schedule');
    return { success: true };
  } catch(e) {
    return { success: false };
  }
}

// --------------------------------------------------------------------------
// ASSETS (ΠΕΡΙΟΥΣΙΟΛΟΓΙΟ & ΚΕΙΜΗΛΙΑΡΧΕΙΟ)
// --------------------------------------------------------------------------

export async function getAssets(category?: string) {
  await seedDummyTemple();
  try {
    const whereClause: any = { templeId: TEMP_TEMPLE_ID };
    if (category && category !== 'ALL') whereClause.category = category;
    
    return await prisma.asset.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
  } catch(e) {
    return [];
  }
}

export async function addAsset(formData: FormData) {
  await seedDummyTemple();
  try {
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const estimatedValueStr = formData.get('estimatedValue') as string;
    const estimatedValue = estimatedValueStr ? parseFloat(estimatedValueStr) : null;
    const acquisitionDateStr = formData.get('acquisitionDate') as string;
    const status = (formData.get('status') as string) || 'ACTIVE';
    
    // File upload logic
    let imageUrl = null;
    const imageFile = formData.get('image') as File | null;
    
    if (imageFile && imageFile.name && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'assets');
      try {
        await fs.mkdir(uploadDir, { recursive: true });
      } catch(e) {}
      
      const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9_\.-]/g, '_')}`;
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, buffer);
      
      imageUrl = `/uploads/assets/${filename}`;
    }

    await prisma.asset.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        name,
        category,
        description: description || null,
        location: location || null,
        estimatedValue: (estimatedValue && !isNaN(estimatedValue)) ? estimatedValue : null,
        acquisitionDate: acquisitionDateStr ? new Date(acquisitionDateStr) : null,
        status,
        imageUrl
      }
    });
    
    revalidatePath('/admin/assets');
    return { success: true };
  } catch(e) {
    console.error(e);
    return { success: false, error: String(e) };
  }
}

export async function updateAssetStatus(id: string, newStatus: string) {
  try {
    await prisma.asset.update({
      where: { id },
      data: { status: newStatus }
    });
    revalidatePath('/admin/assets');
    return { success: true };
  } catch(e) {
    return { success: false };
  }
}

export async function deleteAsset(id: string) {
  try {
    await prisma.asset.delete({ where: { id } });
    revalidatePath('/admin/assets');
    return { success: true };
  } catch(e) {
    return { success: false };
  }
}


// --------------------------------------------------------------------------
// PUBLIC REQUEST FORMS
// --------------------------------------------------------------------------

// Αποθήκευση Δεδομένων Questionnaire (Zευγαριού)
export async function savePublicTokenAnswers(tokenStr: string, answersStr: string) {
  try {
    const token = await prisma.token.findUnique({
      where: { tokenStr }
    });
    
    if (!token) return { success: false, error: 'Το αίτημα δεν υπάρχει πλέον.' };

    await prisma.ceremonyMeta.upsert({
      where: { tokenId: token.id },
      create: {
        tokenId: token.id,
        dataJson: answersStr
      },
      update: {
        dataJson: answersStr
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Σφάλμα αποθήκευσης questionnaire:", error);
    return { success: false, error: "Αποτυχία υποβολής." };
  }
}

// =======================
// ASSIGNMENTS
// =======================

export async function upsertAssignment(data: {
  date: string;
  serviceType: string;
  priest?: string;
  psaltis?: string;
  neokomos?: string;
  notes?: string;
  tokenId?: string;
}) {
  await seedDummyTemple();
  const date = new Date(data.date);
  const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);

  try {
    const existing = await prisma.assignment.findFirst({
      where: {
        templeId: TEMP_TEMPLE_ID,
        date: { gte: startOfDay, lte: endOfDay },
        serviceType: data.serviceType
      }
    });

    if (existing) {
      await prisma.assignment.update({
        where: { id: existing.id },
        data: {
          priest: data.priest || null,
          psaltis: data.psaltis || null,
          neokomos: data.neokomos || null,
          notes: data.notes || null,
          tokenId: data.tokenId || null,
        }
      });
    } else {
      await prisma.assignment.create({
        data: {
          templeId: TEMP_TEMPLE_ID,
          date,
          serviceType: data.serviceType,
          priest: data.priest || null,
          psaltis: data.psaltis || null,
          neokomos: data.neokomos || null,
          notes: data.notes || null,
          tokenId: data.tokenId || null,
        }
      });
    }

    revalidatePath('/admin/assignments');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// =======================
// FINANCE STATS (BI)
// =======================

export async function getDonationStats(year?: number) {
  await seedDummyTemple();
  const currentYear = year || new Date().getFullYear();
  const prevYear = currentYear - 1;

  const currentStart = new Date(`${currentYear}-01-01T00:00:00`);
  const currentEnd = new Date(`${currentYear}-12-31T23:59:59`);
  const prevStart = new Date(`${prevYear}-01-01T00:00:00`);
  const prevEnd = new Date(`${prevYear}-12-31T23:59:59`);

  const [currentDons, prevDons] = await Promise.all([
    prisma.donation.findMany({
      where: { templeId: TEMP_TEMPLE_ID, date: { gte: currentStart, lte: currentEnd } }
    }),
    prisma.donation.findMany({
      where: { templeId: TEMP_TEMPLE_ID, date: { gte: prevStart, lte: prevEnd } }
    }),
  ]);

  // Group by month
  const groupByMonth = (dons: any[]) => {
    const months: Record<number, { total: number; count: number }> = {};
    dons.forEach(d => {
      const m = new Date(d.date).getMonth() + 1;
      if (!months[m]) months[m] = { total: 0, count: 0 };
      months[m].total += d.amount;
      months[m].count++;
    });
    const monthNames = ['','Ιαν','Φεβ','Μαρ','Απρ','Μαΐ','Ιουν','Ιουλ','Αυγ','Σεπ','Οκτ','Νοε','Δεκ'];
    return Object.entries(months).map(([m, v]) => ({
      month: parseInt(m),
      monthName: monthNames[parseInt(m)],
      ...v
    })).sort((a, b) => a.month - b.month);
  };

  // Group by purpose/category
  const catMap: Record<string, number> = {};
  currentDons.forEach(d => {
    const key = d.purpose || 'Αδιευκρίνιστη';
    catMap[key] = (catMap[key] || 0) + d.amount;
  });
  const byCategory = Object.entries(catMap).map(([purpose, total]) => ({ purpose, total }));

  return {
    currentYear: groupByMonth(currentDons),
    prevYear: groupByMonth(prevDons),
    byCategory,
    totalCurrentYear: currentDons.reduce((s, d) => s + d.amount, 0),
    totalPrevYear: prevDons.reduce((s, d) => s + d.amount, 0),
    year: currentYear,
  };
}

// =======================
// SEND LINK EMAIL (action wrapper)
// =======================

export async function sendFormLinkAction(tokenId: string) {
  try {
    const token = await prisma.token.findUnique({
      where: { id: tokenId },
      include: { temple: true }
    });
    if (!token || !token.customerName) return { success: false, error: 'Token ή email δεν βρέθηκε' };

    // Construct the public URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const tokenUrl = `${baseUrl}/request/${token.tokenStr}`;

    const { sendFormLinkEmail } = await import('@/lib/emailService');
    await sendFormLinkEmail({
      to: token.customerEmail || '',
      familyName: token.customerName,
      serviceType: token.serviceType as 'GAMOS' | 'VAPTISI',
      tokenUrl,
      ceremonyDate: token.ceremonyDate?.toLocaleDateString('el-GR'),
      templeName: token.temple.name,
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// =======================
// RBAC — Roles Management
// =======================

export async function createRole(name: string, permissions: {
  canViewFinances?: boolean;
  canEditFinances?: boolean;
  canManageRequests?: boolean;
  canManageRegistry?: boolean;
  canManageSchedule?: boolean;
  canManageAssets?: boolean;
}) {
  await seedDummyTemple();
  try {
    // @ts-ignore
    const role = await prisma.role.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        name,
        ...permissions,
      }
    });
    revalidatePath('/admin/settings/users');
    return { success: true, role };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateRolePermissions(roleId: string, permissions: {
  canViewFinances?: boolean;
  canEditFinances?: boolean;
  canManageRequests?: boolean;
  canManageRegistry?: boolean;
  canManageSchedule?: boolean;
  canManageAssets?: boolean;
}) {
  try {
    // @ts-ignore
    await prisma.role.update({
      where: { id: roleId },
      data: permissions
    });
    revalidatePath('/admin/settings/users');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getAllTemples() {
  return prisma.temple.findMany({
    include: {
      _count: { select: { parishioners: true, tokens: true } },
      donations: { select: { amount: true } }
    },
    orderBy: { name: 'asc' }
  });
}

