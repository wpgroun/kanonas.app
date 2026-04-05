'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/requireAuth'
import { getCurrentTempleId } from './core'
import { genTransactionReceiptPdf } from '@/lib/pdfEngine'

// -- Categories -- //

export async function getFinancialCategories() {
 await requireAuth();
 const templeId = await getCurrentTempleId();
 try {
 return await prisma.financialCategory.findMany({
 where: { templeId },
 orderBy: [ { type: 'asc' }, { name: 'asc' } ]
 });
 } catch (e) {
 return [];
 }
}

export async function addFinancialCategory(data: { name: string, type: string }) {
 const session = await requireAuth();
 if(!session.canEditFinances) return { success: false, error: 'Μη Εξουσιοδοτημένη ενέργεια' };
 
 const templeId = await getCurrentTempleId();
 try {
 const entry = await prisma.financialCategory.create({
 data: { templeId, name: data.name, type: data.type }
 });
 revalidatePath('/admin/finances/categories');
 return { success: true, entry };
 } catch(e) {
 return { success: false, error: 'Σφάλμα δημιουργίας' };
 }
}

export async function deleteFinancialCategory(id: string) {
 const session = await requireAuth();
 if(!session.canEditFinances) return { success: false, error: 'Μη Εξουσιοδοτημένη ενέργεια' };

 const templeId = await getCurrentTempleId();
 try {
 const existing = await prisma.financialCategory.findFirst({ where: { id, templeId } });
 if (!existing) return { success: false, error: 'Unauthorized' };

 // Check if it's used in budgets/expenses/incomes
 const incomeCount = await prisma.income.count({ where: { categoryId: id } });
 const expenseCount = await prisma.expense.count({ where: { categoryId: id } });
 if(incomeCount > 0 || expenseCount > 0) {
 return { success: false, error: 'Δεν μπορεί να διαγραφεί (υπάρχουν έσοδα/έξοδα). Διαβάψτε τα πρώτα ή μεταφέρετέ τα.'}
 }
 await prisma.financialCategory.delete({ where: { id } });
 revalidatePath('/admin/finances/categories');
 return { success: true };
 } catch(e) {
 return { success: false, error: 'Oops! Σφάλμα διαγραφής.' };
 }
}

// -- Budgets & Restructuring -- //

export async function getBudgets(year: number) {
 await requireAuth();
 const templeId = await getCurrentTempleId();
 try {
 return await prisma.budget.findMany({
 where: { templeId, year },
 include: { category: true },
 orderBy: { category: { name: 'asc' } }
 });
 } catch (e) {
 return [];
 }
}

export async function saveBudget(categoryId: string, year: number, estimatedAmt: number, oldAmt: number = 0) {
 const session = await requireAuth();
 if(!session.canEditFinances) return { success: false, error: 'Μη Εξουσιοδοτημένη' };
 
 const templeId = await getCurrentTempleId();

 // Check if year is sealed
 const fy = await prisma.financialYear.findUnique({ where: { templeId_year: { templeId, year } } });
 if (fy?.isSealed) {
 return { success: false, error: 'Το Οικονομικό Έτος είναι σφραγισμένο. Καμία αλλαγή δε μπορεί να γίνει.' };
 }

 try {
 const budget = await prisma.budget.upsert({
 where: { templeId_year_categoryId: { templeId, year, categoryId } },
 update: { estimatedAmt },
 create: { templeId, year, categoryId, estimatedAmt, actualAmt: 0 }
 });

 // If it's an update and value changed, log it (Restructuring)
 if (oldAmt !== estimatedAmt && oldAmt > 0) {
 await prisma.auditLog.create({
 data: {
 templeId,
 userId: session.userId,
 userEmail: 'User', // Will be ignored safely or handled
 action: `ΑΝΑΔΙΑΜΟΡΦΩΣΗ ΠΡΟΫΠΟΛΟΓΙΣΜΟΥ (${year})`,
 detail: `Κατηγορία [${categoryId}] από €${oldAmt} σε €${estimatedAmt}.`,
 }
 }).catch(() => {}); // catch harmlessly if context missing
 }

 revalidatePath('/admin/finances/budget');
 return { success: true, budget };
 } catch(e) {
 return { success: false, error: 'Σφάλμα αποθήκευσης προϋπολογισμού' };
 }
}

// -- Income / Expense & Actuals -- //

export async function addTransaction(data: { type: 'INCOME'|'EXPENSE', categoryId: string, amount: number, date: Date, purpose?: string, donorOrVendor?: string, receiptNumber?: string }) {
 const session = await requireAuth();
 if(!session.canEditFinances) return { success: false, error: 'Μη Εξουσιοδοτημένη' };

 const templeId = await getCurrentTempleId();
 const year = new Date(data.date).getFullYear();

 // Seal Check
 const fy = await prisma.financialYear.findUnique({ where: { templeId_year: { templeId, year } } });
 if (fy?.isSealed) return { success: false, error: `Το ${year} είναι Σφραγισμένο.` };

 try {
 // Transaction
 return await prisma.$transaction(async (tx) => {
 if(data.type === 'INCOME') {
 await tx.income.create({ data: {
 templeId, categoryId: data.categoryId, amount: data.amount, date: data.date,
 description: data.purpose, donorName: data.donorOrVendor, receiptNumber: data.receiptNumber
 } });
 } else {
 await tx.expense.create({ data: {
 templeId, categoryId: data.categoryId, amount: data.amount, date: data.date,
 purpose: data.purpose || 'Γενικό Έξοδο', vendor: data.donorOrVendor, receiptNumber: data.receiptNumber
 } });
 }

 // Update Actuals in Budget
 await tx.budget.upsert({
 where: { templeId_year_categoryId: { templeId, year, categoryId: data.categoryId } },
 update: { actualAmt: { increment: data.amount } },
 create: { templeId, year, categoryId: data.categoryId, estimatedAmt: 0, actualAmt: data.amount }
 });

 // Add an audit log automatically
 await tx.auditLog.create({
 data: {
 templeId, userId: session.userId, userEmail: session.userEmail, 
 action: `NEA ЕГГРАФΗ ${data.type}`, 
 detail: `Kαταχώρηση €${data.amount} στο [${data.categoryId}]`
 }
 }).catch(()=>{});

 return { success: true };
 });
 } catch(e) {
 return { success: false, error: 'Τεχνικό Σφάλμα κατά την αποθήκευση.' };
 }
}

export async function getLedgerTransactions() {
 await requireAuth();
 const templeId = await getCurrentTempleId();
 try {
 const incs = await prisma.income.findMany({ where: { templeId }, include: { category: true }});
 const exps = await prisma.expense.findMany({ where: { templeId }, include: { category: true }});
 
 // Unify them for the timeline
 const all = [
 ...incs.map(i => ({ ...i, type: 'INCOME' as 'INCOME'|'EXPENSE'})),
 ...exps.map(e => ({ ...e, type: 'EXPENSE' as 'INCOME'|'EXPENSE'}))
 ];

 // Sort by date descending
 all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
 return all;
 } catch (e) {
 return [];
 }
}

export async function getFinanceStats() {
 await requireAuth();
 const templeId = await getCurrentTempleId();
 try {
 const year = new Date().getFullYear();
 const prevYear = year - 1;

 const incomes = await prisma.income.findMany({ where: { templeId }, include: { category: true }});
 const expenses = await prisma.expense.findMany({ where: { templeId }, include: { category: true }});

 const totalIncome = incomes.reduce((s: number, i: any) => s + i.amount, 0);
 const totalExpense = expenses.reduce((s: number, e: any) => s + e.amount, 0);

 const totalCurrentYear = incomes.filter((i: any) => new Date(i.date).getFullYear() === year).reduce((s: number,i: any) => s + i.amount, 0);
 const totalPrevYear = incomes.filter((i: any) => new Date(i.date).getFullYear() === prevYear).reduce((s: number,i: any) => s + i.amount, 0);

 const totalExpenseCurrentYear = expenses.filter((e: any) => new Date(e.date).getFullYear() === year).reduce((s: number,e: any) => s + e.amount, 0);
 const totalExpensePrevYear = expenses.filter((e: any) => new Date(e.date).getFullYear() === prevYear).reduce((s: number,e: any) => s + e.amount, 0);

 const byCategory = incomes.reduce((acc: any, i: any) => {
 const catName = i.category?.name || 'Ακατηγοριοποίητα';
 acc[catName] = (acc[catName] || 0) + i.amount;
 return acc;
 }, {} as Record<string, number>);

 const byExpenseCategory = expenses.reduce((acc: any, e: any) => {
 const catName = e.category?.name || 'Ακατηγοριοποίητα';
 acc[catName] = (acc[catName] || 0) + e.amount;
 return acc;
 }, {} as Record<string, number>);

 const monthNames = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
 const currentYearData = monthNames.map((name, index) => ({ month: index + 1, monthName: name, incomeTotal: 0, expenseTotal: 0 }));
 const prevYearData = monthNames.map((name, index) => ({ month: index + 1, monthName: name, incomeTotal: 0, expenseTotal: 0 }));

 incomes.forEach((i: any) => {
 const d = new Date(i.date);
 const y = d.getFullYear();
 const m = d.getMonth();
 if (y === year) currentYearData[m].incomeTotal += i.amount;
 else if (y === prevYear) prevYearData[m].incomeTotal += i.amount;
 });

 expenses.forEach((e: any) => {
 const d = new Date(e.date);
 const y = d.getFullYear();
 const m = d.getMonth();
 if (y === year) currentYearData[m].expenseTotal += e.amount;
 else if (y === prevYear) prevYearData[m].expenseTotal += e.amount;
 });

 const categoryDataArray = Object.entries(byCategory).map(([purpose, total]) => ({ purpose, total: total as number }));
 const expenseCategoryDataArray = Object.entries(byExpenseCategory).map(([purpose, total]) => ({ purpose, total: total as number }));

 return { 
 totalIncome, totalExpense, totalCurrentYear, totalPrevYear, totalExpenseCurrentYear, totalExpensePrevYear,
 byCategory: categoryDataArray, byExpenseCategory: expenseCategoryDataArray, 
 currentYearData, prevYearData, year 
 };
 } catch(e) {
 return { 
 totalIncome: 0, totalExpense: 0, totalCurrentYear: 0, totalPrevYear: 0, totalExpenseCurrentYear: 0, totalExpensePrevYear: 0,
 byCategory: [], byExpenseCategory: [], currentYearData: [], prevYearData: [], year: 2026 
 };
 }
}

export async function sealFinancialYear(year: number) {
 const session = await requireAuth();
 if(!session.isSuperAdmin && !session.isHeadPriest) {
 return { success: false, error: 'Μόνο ο Προϊστάμενος του Ναού μπορεί να σφραγίσει τη χρονιά.' };
 }
 
 const templeId = await getCurrentTempleId();
 try {
 await prisma.$transaction(async (tx) => {
 await tx.financialYear.upsert({
 where: { templeId_year: { templeId, year } },
 update: { isSealed: true, sealedAt: new Date(), sealedBy: session.userId },
 create: { templeId, year, isSealed: true, sealedAt: new Date(), sealedBy: session.userId }
 });

 await tx.auditLog.create({
 data: {
 templeId, userId: session.userId, userEmail: session.userEmail, 
 action: 'ΣΦΡΑΓΙΣΜΑ ΑΠΟΛΟΓΙΣΜΟΥ', 
 detail: `Οικονομικό Έτος ${year} Κλείδωσε μόνιμα.`
 }
 });
 });

 revalidatePath('/admin/finances');
 revalidatePath('/admin/finances/budget');
 return { success: true };
 } catch(e) {
 return { success: false, error: 'Τεχνικό Σφάλμα Σφραγίσματος.' };
 }
}

// -- QUARTERLY TAXES (ΕΡΓΑΣΙΕΣ ΤΡΙΜΗΝΟΥ) -- //

export async function calculateQuarterTaxes(year: number, quarter: number) {
 await requireAuth();
 const templeId = await getCurrentTempleId();
 
 // Calculate date range for the quarter
 const startMonth = (quarter - 1) * 3; 
 const startDate = new Date(year, startMonth, 1);
 const endDate = new Date(year, startMonth + 3, 0);

 try {
 const incomes = await prisma.income.findMany({
 where: {
 templeId,
 date: { gte: startDate, lte: endDate }
 }
 });

 const totalIncome = incomes.reduce((acc: number, i: any) => acc + i.amount, 0);
 
 // The statutory percentages
 const metropolisShare = totalIncome * 0.10; // 10%
 const tpoekeShare = totalIncome * 0.02; // 2%
 const apostolikiDiakonia = totalIncome * 0.01; // 1%

 return {
 success: true,
 totalIncome,
 taxes: [
 { name: 'Ιερά Μητρόπολη (10%)', amount: metropolisShare },
 { name: 'Τ.Π.Ο.Ε.Κ.Ε. (2%)', amount: tpoekeShare },
 { name: 'Αποστολική Διακονία (1%)', amount: apostolikiDiakonia }
 ]
 };
 } catch(e) {
 return { success: false, error: 'Αποτυχία υπολογισμού τριμηνίας.' };
 }
}

export async function payQuarterTaxes(year: number, quarter: number) {
 const session = await requireAuth();
 if(!session.canEditFinances) return { success: false, error: 'Μη εξουσιοδοτημένη ενέργεια' };

 const templeId = await getCurrentTempleId();
 
 const calc = await calculateQuarterTaxes(year, quarter);
 if (!calc.success || !calc.taxes) return { success: false, error: 'Αποτυχία ανάγνωσης φόρων' };

 try {
 // First ensure an 'Ecclesiastical Taxes' category exists
 let taxCategory = await prisma.financialCategory.findFirst({
 where: { templeId, type: 'EXPENSE', name: 'Υποχρεώσεις Τριμήνου & Νόμιμα Ποσοστά' }
 });

 if (!taxCategory) {
 taxCategory = await prisma.financialCategory.create({
 data: { templeId, type: 'EXPENSE', name: 'Υποχρεώσεις Τριμήνου & Νόμιμα Ποσοστά' }
 });
 }

 const today = new Date();
 const voucherNumber = `Q${quarter}-${year}-SYS`;

 // Create an expense for each statutory body
 for (const tax of calc.taxes) {
 if (tax.amount > 0) {
 await prisma.expense.create({
 data: {
 templeId,
 categoryId: taxCategory.id,
 amount: tax.amount,
 date: today,
 purpose: `Εκκαθάριση Τριμήνου Q${quarter} ${year} - ${tax.name}`,
 receiptNumber: voucherNumber + '-' + tax.name.substring(0,3),
 vendor: tax.name
 }
 });
 }
 }

 return { success: true };
 } catch(e) {
 return { success: false, error: 'Αποτυχία καταχώρησης πληρωμών.' };
 }
}

export async function addExpense(data: any) {
 return addTransaction({ type: 'EXPENSE', ...data });
}
export async function getDonations() {
 await requireAuth();
 const templeId = await getCurrentTempleId();
 try {
 return await prisma.donation.findMany({
 where: { templeId },
 include: { parishioner: true },
 orderBy: { date: 'desc' }
 });
 } catch (e) {
 return [];
 }
}

export async function createDonation(data: { amount: number; purpose?: string; date: Date; receiptNumber?: string; donorName?: string; parishionerId?: string }) {
 const session = await requireAuth();
 const templeId = await getCurrentTempleId();
 try {
 const donation = await prisma.donation.create({
 data: {
 templeId,
 amount: data.amount,
 purpose: data.purpose,
 date: data.date,
 receiptNumber: data.receiptNumber,
 donorName: data.donorName,
 parishionerId: data.parishionerId,
 }
 });
 revalidatePath('/admin/finances');
 return { success: true, donation };
 } catch (e) {
 return { success: false, error: 'Σφάλμα καταχώρησης' };
 }
}

export async function getDonationStats() {
 await requireAuth();
 const templeId = await getCurrentTempleId();
 try {
 const total = await prisma.donation.aggregate({
 where: { templeId },
 _sum: { amount: true }
 });
 const currentYear = new Date().getFullYear();
 const yearly = await prisma.donation.aggregate({
 where: { templeId, date: { gte: new Date(currentYear, 0, 1) } },
 _sum: { amount: true }
 });
 return { total: total._sum.amount || 0, yearly: yearly._sum.amount || 0 };
 } catch (e) {
 return { total: 0, yearly: 0 };
 }
}

export async function downloadReceiptAction(tx: any) {
 const session = await requireAuth();
 if(!session.canViewFinances) return { success: false, error: 'Μη Εξουσιοδοτημένη ενέργεια' };

 try {
 const templeId = await getCurrentTempleId();
 const temple = await prisma.temple.findUnique({ where: { id: templeId } });
 if (!temple) return { success: false, error: 'Δεν βρέθηκε ναός' };

 let settings = {};
 if (temple.settings) {
 try { settings = JSON.parse(temple.settings as string); } catch(e){}
 }
 const pdfBase64 = (await genTransactionReceiptPdf(tx, { ...settings, templeName: temple.name })).toString('base64');
 
 // Log to Audit
 await prisma.auditLog.create({
 data: {
 templeId,
 userId: session.userId,
 userEmail: session.userEmail,
 action: 'ΕΚΤΥΠΩΣΗ_ΠΑΡΑΣΤΑΤΙΚΟΥ',
 detail: `Εκτυπώθηκε παραστατικό λογιστικής τακτοποίησης για την κίνηση με ID: ${tx.id.substring(0,6)}`
 }
 });

 return { success: true, pdfBase64 };
 } catch (e) {
 console.error(e);
 return { success: false, error: 'Σφάλμα παραγωγής PDF' };
 }
}

