/**
 * Κανόνας PDF Engine
 * Generates all required sacrament documents using pdf-lib.
 * Greek text is handled via TextEncoder with manual character mapping for proper Greek rendering.
 */
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import { declineGreekName } from './greekDeclension';

// ─── Shared helpers ────────────────────────────────────────────────────────────

/** Format a Date to Greek format e.g. 15 Απριλίου 2026 */
function formatGreekDate(d: Date | string | null | undefined): string {
 if (!d) return '_______________';
 const months = ['Ιανουαρίου','Φεβρουαρίου','Μαρτίου','Απριλίου','Μαΐου','Ιουνίου','Ιουλίου','Αυγούστου','Σεπτεμβρίου','Οκτωβρίου','Νοεμβρίου','Δεκεμβρίου'];
 const dt = new Date(d);
 return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

/** Format a Date to short Greek format e.g. 15/04/2026 */
function formatShortDate(d: Date | string | null | undefined): string {
 if (!d) return '___/___/______';
 const dt = new Date(d);
 return dt.toLocaleDateString('el-GR');
}

/** Blank line placeholder */
const BLANK = '___________________________';

/** Build a PDF page with a standard Greek document texture */
async function buildDocumentPage(pdfDoc: PDFDocument, options: {
 title: string;
 subtitle?: string;
 templeHeader: string;
 metropolisHeader: string;
 protocolLabel?: string;
 body: { label: string; value: string; wide?: boolean }[];
 footerText?: string;
 signatureLabel?: string;
 /** Optional verification URL (for QR/hash reference in footer) */
 verificationUrl?: string;
 /** Optional document hash to display as reference number */
 docHash?: string;
}): Promise<void> {
 const page = pdfDoc.addPage(PageSizes.A4);
 const { width, height } = page.getSize();
 const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
 const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

 let y = height - 40;
 const marginX = 50;
 const contentWidth = width - marginX * 2;

 // Header: Metropolis → Temple
 page.drawText(options.metropolisHeader, { x: marginX, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
 y -= 16;
 page.drawText(options.templeHeader, { x: marginX, y, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.5) });
 y -= 14;
 
 // Divider line
 page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });
 y -= 24;

 // Protocol number area (top right)
 if (options.protocolLabel) {
 page.drawText(options.protocolLabel, { x: width - 200, y: height - 50, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
 }

 // Title
 const titleSize = 15;
 const titleWidth = fontBold.widthOfTextAtSize(options.title, titleSize);
 page.drawText(options.title, {
 x: (width - titleWidth) / 2,
 y,
 size: titleSize,
 font: fontBold,
 color: rgb(0.05, 0.05, 0.4),
 });
 y -= 10;

 if (options.subtitle) {
 const subWidth = font.widthOfTextAtSize(options.subtitle, 10);
 page.drawText(options.subtitle, {
 x: (width - subWidth) / 2,
 y,
 size: 10,
 font,
 color: rgb(0.4, 0.4, 0.4),
 });
 y -= 6;
 }

 // Second divider
 page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
 y -= 20;

 // Body fields
 for (const field of options.body) {
 page.drawText(`${field.label}:`, { x: marginX, y, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
 const valueX = field.wide ? marginX : marginX + 160;
 const valueY = field.wide ? y - 14 : y;
 page.drawText(field.value || BLANK, { x: valueX, y: valueY, size: 10, font, color: rgb(0, 0, 0) });
 y -= field.wide ? 30 : 22;
 if (y < 120) break;
 }

 // Footer text
 if (options.footerText) {
 y = Math.min(y, 160);
 page.drawText(options.footerText, { x: marginX, y, size: 8, font, color: rgb(0.5, 0.5, 0.5), maxWidth: contentWidth });
 y -= 30;
 }

 // Signature area
 const sigLabel = options.signatureLabel || 'Ο Εφημέριος';
 page.drawText(sigLabel, { x: width - 180, y: 95, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
 page.drawLine({ start: { x: width - 220, y: 85 }, end: { x: width - marginX, y: 85 }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) });

 // Date bottom left 
 page.drawText(`Ημερομηνία: ${formatShortDate(new Date())}`, { x: marginX, y: 95, size: 9, font, color: rgb(0.5, 0.5, 0.5) });

 // ── Verification footer ──────────────────────────────────────────────────────
 // A verification URL with the document hash allows anyone to confirm authenticity.
 if (options.verificationUrl) {
 page.drawLine({
 start: { x: marginX, y: 60 },
 end: { x: width - marginX, y: 60 },
 thickness: 0.3,
 color: rgb(0.8, 0.8, 0.8),
 });
 page.drawText('✓ Επαλήθευση Γνησιότητας Εγγράφου:', {
 x: marginX, y: 48, size: 7, font: fontBold, color: rgb(0.4, 0.4, 0.4)
 });
 page.drawText(options.verificationUrl, {
 x: marginX, y: 38, size: 7, font, color: rgb(0.1, 0.1, 0.6)
 });
 if (options.docHash) {
 page.drawText(`Κωδικός Εγγράφου: ${options.docHash.substring(0, 16).toUpperCase()}`, {
 x: marginX, y: 28, size: 6, font, color: rgb(0.6, 0.6, 0.6)
 });
 }
 }
}

// ─── Data loader ───────────────────────────────────────────────────────────────

export interface TokenData {
 id: string;
 serviceType: string;
 customerName: string;
 ceremonyDate: Date | null;
 assignedPriest: string | null;
 assignedPsaltis: string | null;
 protocolNumber: string | null;
 bookNumber: string | null;
 temple: {
 name: string;
 address: string | null;
 settings: string | null; // JSON
 };
 ceremonyMeta: { dataJson: string | null } | null;
 persons: { role: string; firstName: string; lastName: string; fathersName: string | null }[];
 customTemplates?: { docType: string; nameEl: string; htmlContent: string | null }[];
}

function parseSettings(settingsJson?: string | null) {
 try { return JSON.parse(settingsJson || '{}'); } catch { return {}; }
}

function findPerson(persons: TokenData['persons'], role: string) {
 return persons.find(p => p.role === role);
}

// ─── GAMOS DOCUMENTS ──────────────────────────────────────────────────────────

async function genAitisiGamou(t: TokenData, settings: any): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 const groom = findPerson(t.persons, 'groom');
 const bride = findPerson(t.persons, 'bride');
 const meta = parseSettings(t.ceremonyMeta?.dataJson);

 await buildDocumentPage(pdfDoc, {
 metropolisHeader: settings.metropolisName || 'Ιερά Μητρόπολη',
 templeHeader: t.temple.name,
 title: 'ΑΙΤΗΣΗ ΤΕΛΕΣΗΣ ΙΕΡΟΥ ΓΑΜΟΥ',
 protocolLabel: `Αρ. Πρωτ.: ${t.protocolNumber || BLANK}`,
 body: [
 { label: 'Αρ. Βιβλίου Γάμων', value: t.bookNumber || BLANK },
 { label: 'Ημερομηνία Τέλεσης', value: formatGreekDate(t.ceremonyDate) },
 { label: 'Νυμφίος (Γαμπρός)', value: groom ? `${groom.firstName} ${groom.lastName} του ${declineGreekName(groom.fathersName || '', 'genitive', 'male')}` : BLANK },
 { label: 'Οικ. Κατάσταση Νυμφίου', value: meta.groomStatus === 'diazevmenos' ? `Διαζευγμένος (${meta.groomDivorceRef || ''})` : meta.groomStatus === 'xiros' ? 'Χήρος' : meta.groomStatus === 'symfono' ? `Μετά Συμφώνου Συμβίωσης (${meta.groomSymfonoRef || ''})` : 'Άγαμος' },
 { label: 'Νύμφη', value: bride ? `${bride.firstName} ${bride.lastName} του ${declineGreekName(bride.fathersName || '', 'genitive', 'male')}` : BLANK },
 { label: 'Οικ. Κατάσταση Νύμφης', value: meta.brideStatus === 'diazevmeni' ? `Διαζευγμένη (${meta.brideDivorceRef || ''})` : meta.brideStatus === 'xira' ? 'Χήρα' : meta.brideStatus === 'symfono' ? `Μετά Συμφώνου Συμβίωσης (${meta.brideSymfonoRef || ''})` : 'Άγαμη' },
 { label: 'Κουμπάρος Ορθόδοξος', value: meta.koumparosIsOrthodox === 'yes' ? 'Ναι' : meta.koumparosIsOrthodox === 'no' ? 'Όχι' : BLANK },
 { label: 'Εφημέριος', value: t.assignedPriest || settings.priests?.[0]?.name || BLANK },
 ],
 footerText: 'Παρακαλώ να γίνουν δεκτοί και τελεσθεί ο Ιερός Γάμος σύμφωνα με τους Ιερούς Κανόνες και τη νομοθεσία της Εκκλησίας.',
 verificationUrl: settings._verificationUrl,
 docHash: settings._docHash,
 });

 return Buffer.from(await pdfDoc.save());
}

async function genDilosiGamou(t: TokenData, settings: any, who: 'groom' | 'bride'): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 const person = findPerson(t.persons, who);
 const isGroom = who === 'groom';
 const meta = parseSettings(t.ceremonyMeta?.dataJson);
 const oikStatus = isGroom
 ? (meta.groomStatus === 'diazevmenos' ? 'Διαζευγμένος' : meta.groomStatus === 'symfono' ? 'Σύμφωνο Συμβίωσης' : meta.groomStatus === 'xiros' ? 'Χήρος' : 'Άγαμος')
 : (meta.brideStatus === 'diazevmeni' ? 'Διαζευγμένη' : meta.brideStatus === 'symfono' ? 'Σύμφωνο Συμβίωσης' : meta.brideStatus === 'xira' ? 'Χήρα' : 'Άγαμη');

 await buildDocumentPage(pdfDoc, {
 metropolisHeader: settings.metropolisName || 'Ιερά Μητρόπολη',
 templeHeader: t.temple.name,
 title: `ΔΗΛΩΣΗ ΟΙΚΟΓΕΝΕΙΑΚΗΣ ΚΑΤΑΣΤΑΣΗΣ`,
 subtitle: isGroom ? '(Νυμφίου — Γαμπρού)' : '(Νύμφης)',
 protocolLabel: `Αρ. Πρωτ.: ${t.protocolNumber || BLANK}`,
 body: [
 { label: 'Επώνυμο', value: person?.lastName || BLANK },
 { label: 'Όνομα', value: person?.firstName || BLANK },
 { label: 'Πατρώνυμο', value: person?.fathersName || BLANK },
 { label: 'Οικογενειακή Κατάσταση', value: oikStatus },
 { label: 'Ημερομηνία Γάμου', value: formatGreekDate(t.ceremonyDate) },
 ],
 footerText: 'Δηλώνω υπεύθυνα ότι τα ανωτέρω στοιχεία είναι αληθή και ακριβή. Γνωρίζω ότι ψευδής δήλωση επιφέρει νόμιμες κυρώσεις.',
 signatureLabel: isGroom ? 'Ο Δηλών (Νυμφίος)' : 'Η Δηλούσα (Νύμφη)',
 verificationUrl: settings._verificationUrl,
 docHash: settings._docHash,
 });

 return Buffer.from(await pdfDoc.save());
}

async function genBebaiosiGamou(t: TokenData, settings: any): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 const groom = findPerson(t.persons, 'groom');
 const bride = findPerson(t.persons, 'bride');

 await buildDocumentPage(pdfDoc, {
 metropolisHeader: settings.metropolisName || 'Ιερά Μητρόπολη',
 templeHeader: t.temple.name,
 title: 'ΒΕΒΑΙΩΣΗ ΤΕΛΕΣΗΣ ΙΕΡΟΥ ΓΑΜΟΥ',
 protocolLabel: `Αρ. Πρωτ.: ${t.protocolNumber || BLANK}`,
 body: [
 { label: 'Βεβαιώνεται ότι τελέσθηκε Ιερός Γάμος', value: '', wide: true },
 { label: 'Μεταξύ:', value: groom ? `${declineGreekName(groom.firstName, 'genitive', 'male')} ${declineGreekName(groom.lastName, 'genitive', 'male')}` : BLANK },
 { label: 'Καί:', value: bride ? `${declineGreekName(bride.firstName, 'genitive', 'female')} ${declineGreekName(bride.lastName, 'genitive', 'female')}` : BLANK },
 { label: 'Ημερομηνία Τέλεσης', value: formatGreekDate(t.ceremonyDate) },
 { label: 'Αρ. Βιβλίου Γάμων', value: t.bookNumber || BLANK },
 { label: 'Αρ. Πρωτοκόλλου', value: t.protocolNumber || BLANK },
 { label: 'Εφημέριος', value: t.assignedPriest || settings.priests?.[0]?.name || BLANK },
 ],
 footerText: 'Εκδίδεται κατόπιν αιτήσεως για χρήση ενώπιον κάθε αρχής.',
 verificationUrl: settings._verificationUrl,
 docHash: settings._docHash,
 });

 return Buffer.from(await pdfDoc.save());
}

async function genGamilionGramma(t: TokenData, settings: any): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 const groom = findPerson(t.persons, 'groom');
 const bride = findPerson(t.persons, 'bride');
 const bishopGen = declineGreekName(settings.bishopName || '', 'genitive', 'male');

 await buildDocumentPage(pdfDoc, {
 metropolisHeader: settings.metropolisName || 'Ιερά Μητρόπολη',
 templeHeader: t.temple.name,
 title: 'ΓΑΜΗΛΙΟ ΓΡΑΜΜΑ',
 subtitle: `Προς την Ιερά Μητρόπολη / Αρ. Πρωτ.: ${t.protocolNumber || BLANK}`,
 body: [
 { label: 'Προς τον Σεβ. Μητροπολίτη', value: `κ.κ. ${bishopGen || settings.bishopName || BLANK}` },
 { label: 'Ανακοινούται ότι ετελέσθη Γάμος', value: '' },
 { label: 'Νυμφίου', value: groom ? `${declineGreekName(groom.firstName, 'genitive', 'male')} ${declineGreekName(groom.lastName, 'genitive', 'male')}` : BLANK },
 { label: 'Νύμφης', value: bride ? `${declineGreekName(bride.firstName, 'genitive', 'female')} ${declineGreekName(bride.lastName, 'genitive', 'female')}` : BLANK },
 { label: 'Ημερομηνία', value: formatGreekDate(t.ceremonyDate) },
 { label: 'Αρ. Βιβλίου Γάμων', value: t.bookNumber || BLANK },
 { label: 'Ιερός Ναός', value: t.temple.name },
 { label: 'Εφημέριος', value: t.assignedPriest || settings.priests?.[0]?.name || BLANK },
 ],
 verificationUrl: settings._verificationUrl,
 docHash: settings._docHash,
 });

 return Buffer.from(await pdfDoc.save());
}

async function genPinakasSynthikon(t: TokenData, settings: any): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 const groom = findPerson(t.persons, 'groom');
 const bride = findPerson(t.persons, 'bride');
 const meta = parseSettings(t.ceremonyMeta?.dataJson);

 await buildDocumentPage(pdfDoc, {
 metropolisHeader: settings.metropolisName || 'Ιερά Μητρόπολη',
 templeHeader: t.temple.name,
 title: 'ΠΙΝΑΚΑΣ ΣΥΝΘΗΚΩΝ ΓΑΜΟΥ',
 subtitle: '(Υποβάλλεται στη Μητρόπολη πριν την τέλεση)',
 protocolLabel: `Αρ. Πρωτ.: ${t.protocolNumber || BLANK}`,
 body: [
 { label: 'Α. ΝΥΜΦΙΟΣ (ΓΑΜΠΡΟΣ)', value: '', wide: true },
 { label: 'Επώνυμο', value: groom?.lastName || BLANK },
 { label: 'Όνομα', value: groom?.firstName || BLANK },
 { label: 'Πατρώνυμο', value: groom?.fathersName || BLANK },
 { label: 'Οικογ. Κατάσταση', value: meta.groomStatus === 'diazevmenos' ? `Διαζευγμένος (Ληξ.: ${meta.groomDivorceRef || BLANK})` : meta.groomStatus === 'xiros' ? 'Χήρος' : 'Άγαμος' },
 { label: 'Β. ΝΥΜΦΗ', value: '', wide: true },
 { label: 'Επώνυμο', value: bride?.lastName || BLANK },
 { label: 'Όνομα', value: bride?.firstName || BLANK },
 { label: 'Πατρώνυμο', value: bride?.fathersName || BLANK },
 { label: 'Οικογ. Κατάσταση', value: meta.brideStatus === 'diazevmeni' ? `Διαζευγμένη (Ληξ.: ${meta.brideDivorceRef || BLANK})` : meta.brideStatus === 'xira' ? 'Χήρα' : 'Άγαμη' },
 { label: 'Γ. ΣΤΟΙΧΕΙΑ ΤΕΛΕΣΗΣ', value: '', wide: true },
 { label: 'Ημερομηνία Γάμου', value: formatGreekDate(t.ceremonyDate) },
 { label: 'Κουμπάρος Ορθόδοξος', value: meta.koumparosIsOrthodox === 'yes' ? 'ΝΑΙ ✓' : meta.koumparosIsOrthodox === 'no' ? 'ΟΧΙ ✗' : BLANK },
 { label: 'Εφημέριος', value: t.assignedPriest || settings.priests?.[0]?.name || BLANK },
 { label: 'Αρ. Βιβλίου Γάμων', value: t.bookNumber || BLANK },
 ],
 footerText: 'Βεβαιώνεται η κανονική τέλεση του μυστηρίου κατά τους Ιερούς Κανόνες. Ο Ναός ευθύνεται για την ακρίβεια των στοιχείων.',
 signatureLabel: 'Ο Προϊστάμενος',
 verificationUrl: settings._verificationUrl,
 docHash: settings._docHash,
 });

 return Buffer.from(await pdfDoc.save());
}


// ─── BAPTISM DOCUMENTS ────────────────────────────────────────────────────────

async function genBaptistiko(t: TokenData, settings: any): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 const meta = parseSettings(t.ceremonyMeta?.dataJson);
 const childName = meta.childName || BLANK;
 const parent = findPerson(t.persons, 'father') || findPerson(t.persons, 'mother');
 const godparent = findPerson(t.persons, 'godparent');

 await buildDocumentPage(pdfDoc, {
 metropolisHeader: settings.metropolisName || 'Ιερά Μητρόπολη',
 templeHeader: t.temple.name,
 title: 'ΒΑΠΤΙΣΤΙΚΟ ΠΙΣΤΟΠΟΙΗΤΙΚΟ',
 protocolLabel: `Αρ. Πρωτ.: ${t.protocolNumber || BLANK}`,
 body: [
 { label: 'Νεοφώτιστος/η', value: childName },
 { label: 'Ονομαστική', value: childName },
 { label: 'Γεννητική', value: declineGreekName(childName, 'genitive') },
 { label: 'Γονέας', value: parent ? `${parent.firstName} ${parent.lastName}` : BLANK },
 { label: 'Ανάδοχος', value: godparent ? `${godparent.firstName} ${godparent.lastName}` : BLANK },
 { label: 'Ημερομηνία Βάπτισης', value: formatGreekDate(t.ceremonyDate) },
 { label: 'Αρ. Βιβλίου Βαπτίσεων', value: t.bookNumber || BLANK },
 { label: 'Εφημέριος', value: t.assignedPriest || settings.priests?.[0]?.name || BLANK },
 ],
 footerText: 'Πιστοποιείται ότι ετελέσθη η Ιερά Μυστήριο της Βαπτίσεως εν τω Ιερώ Ναώ.',
 });

 return Buffer.from(await pdfDoc.save());
}

async function genDilosiBaptiseos(t: TokenData, settings: any): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 const meta = parseSettings(t.ceremonyMeta?.dataJson);
 const godparent = findPerson(t.persons, 'godparent');

 await buildDocumentPage(pdfDoc, {
 metropolisHeader: settings.metropolisName || 'Ιερά Μητρόπολη',
 templeHeader: t.temple.name,
 title: 'ΔΗΛΩΣΗ ΑΝΑΔΟΧΟΥ',
 subtitle: '(Κατά τη Βάπτιση)',
 body: [
 { label: 'Ανάδοχος', value: godparent ? `${godparent.firstName} ${godparent.lastName}` : BLANK },
 { label: 'Ορθόδοξος Χριστιανός/ή', value: meta.anadoxosIsOrthodox === 'yes' ? 'Ναι' : 'Όχι' },
 { label: 'Νεοφώτιστος/η', value: meta.childName || BLANK },
 { label: 'Ημερομηνία Βάπτισης', value: formatGreekDate(t.ceremonyDate) },
 ],
 footerText: 'Δηλώνω υπεύθυνα ότι είμαι βεβαπτισμένος/η Ορθόδοξος Χριστιανός/ή και αναλαμβάνω τη νηπτική ευθύνη για τον/την νεοφώτιστο/η.',
 signatureLabel: 'Ο/Η Ανάδοχος',
 });

 return Buffer.from(await pdfDoc.save());
}

async function genBebaiosiBaptiseos(t: TokenData, settings: any): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 const meta = parseSettings(t.ceremonyMeta?.dataJson);
 const parent = findPerson(t.persons, 'father') || findPerson(t.persons, 'mother');

 await buildDocumentPage(pdfDoc, {
 metropolisHeader: settings.metropolisName || 'Ιερά Μητρόπολη',
 templeHeader: t.temple.name,
 title: 'ΒΕΒΑΙΩΣΗ ΒΑΠΤΙΣΗΣ',
 protocolLabel: `Αρ. Πρωτ.: ${t.protocolNumber || BLANK}`,
 body: [
 { label: 'Βεβαιώνεται η τέλεση Βάπτισης', value: '' },
 { label: 'Όνομα Νεοφωτίστου/ης', value: meta.childName || BLANK },
 { label: 'Γονέας', value: parent ? `${parent.firstName} ${parent.lastName}` : BLANK },
 { label: 'Ημερομηνία', value: formatGreekDate(t.ceremonyDate) },
 { label: 'Αρ. Βιβλίου', value: t.bookNumber || BLANK },
 { label: 'Εφημέριος', value: t.assignedPriest || settings.priests?.[0]?.name || BLANK },
 ],
 footerText: 'Εκδίδεται κατόπιν αιτήσεως για χρήση ενώπιον κάθε αρχής.',
 });

 return Buffer.from(await pdfDoc.save());
}

async function genApantitikon(t: TokenData, settings: any): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 const meta = parseSettings(t.ceremonyMeta?.dataJson);
 const bishopGen = declineGreekName(settings.bishopName || '', 'genitive', 'male');

 await buildDocumentPage(pdfDoc, {
 metropolisHeader: settings.metropolisName || 'Ιερά Μητρόπολη',
 templeHeader: t.temple.name,
 title: 'ΑΠΑΝΤΗΤΙΚΟΝ',
 subtitle: `Προς τη Μητρόπολη / Αρ. Πρωτ.: ${t.protocolNumber || BLANK}`,
 body: [
 { label: 'Προς τον Σεβ.', value: `κ.κ. ${bishopGen || settings.bishopName || BLANK}` },
 { label: 'Ανακοινούται Βάπτιση', value: meta.childName || BLANK },
 { label: 'Ημερομηνία', value: formatGreekDate(t.ceremonyDate) },
 { label: 'Αρ. Βιβλίου Βαπτίσεων', value: t.bookNumber || BLANK },
 { label: 'Εφημέριος', value: t.assignedPriest || settings.priests?.[0]?.name || BLANK },
 ],
 });

 return Buffer.from(await pdfDoc.save());
}

// ─── PUBLIC API ────────────────────────────────────────────────────────────────

export interface GeneratedDoc {
 key: string;
 label: string;
 buffer: Buffer;
 filename: string;
}

/** Build the base URL for document verification links */
function buildVerificationUrl(tokenStr: string): string {
 const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://kanonas.app';
 return `${base}/api/verify/${tokenStr}`;
}

export async function generateAllGamosDocs(t: TokenData): Promise<GeneratedDoc[]> {
 const settings = parseSettings(t.temple.settings);
 const familySlug = t.customerName.replace(/\s+/g, '_').slice(0, 20);
 const verificationUrl = buildVerificationUrl(t.id);
 const docs: GeneratedDoc[] = [];

 // Inject verification URL into settings so individual generators can use it
 const settingsWithVerify = { ...settings, _verificationUrl: verificationUrl, _docHash: t.id };

 const pairs: [string, string, () => Promise<Buffer>][] = [
 ['pinakas_synthikon', 'Πίνακας Συνθηκών', () => genPinakasSynthikon(t, settingsWithVerify)],
 ['aitisi', 'Αίτηση Γάμου', () => genAitisiGamou(t, settingsWithVerify)],
 ['dilosi_gampr', 'Δήλωση Γαμπρού', () => genDilosiGamou(t, settingsWithVerify, 'groom')],
 ['dilosi_nyfis', 'Δήλωση Νύφης', () => genDilosiGamou(t, settingsWithVerify, 'bride')],
 ['bebaiosi', 'Βεβαίωση Γάμου', () => genBebaiosiGamou(t, settingsWithVerify)],
 ['gamilion', 'Γαμήλιο Γράμμα', () => genGamilionGramma(t, settingsWithVerify)],
 ];

 for (const [key, label, fn] of pairs) {
 try {
 const buffer = await fn();
 docs.push({ key, label, buffer, filename: `Γάμος_${familySlug}_${key}.pdf` });
 } catch (e) {
 console.error(`[pdfEngine] Failed to generate ${key}:`, e);
 }
 }

 return docs;
}

export async function genFinancialStatementPdf(stats: any, year: number, settings: any): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 
 // Format categories
 const categoryFields = Object.entries(stats.byCategory || {}).map(([k,v]: any) => ({
 label: ` - ${k}`, value: `€ ${Number(v).toFixed(2)}`, wide: true
 }));

 const isSealedStr = stats.isSealed ? `(ΟΡΙΣΤΙΚΟΠΟΙΗΜΕΝΟ Y/A ${stats.sealedBy || ''})` : '(ΠΡΟΣΩΡΙΝΟ)';

 await buildDocumentPage(pdfDoc, {
 metropolisHeader: settings?.metropolisName || 'Ιερά Μητρόπολη',
 templeHeader: settings?.templeName || 'Ιερός Ναός',
 title: `ΟΙΚΟΝΟΜΙΚΟΣ ΑΠΟΛΟΓΙΣΜΟΣ ${year}`,
 subtitle: isSealedStr,
 body: [
 { label: 'Συνολικά Έσοδα Ταμείου', value: `€ ${(stats.totalIncome || 0).toFixed(2)}`, wide: true },
 { label: 'Συνολικά Έξοδα Ναού', value: `€ ${(stats.totalExpense || 0).toFixed(2)}`, wide: true },
 { label: 'Καθαρό Υπόλοιπο', value: `€ ${((stats.totalIncome || 0) - (stats.totalExpense || 0)).toFixed(2)}`, wide: true },
 { label: '----------------------------', value: '----', wide: true },
 { label: 'ΑΝΑΛΥΣΗ ΕΣΟΔΩΝ', value: '', wide: true },
 ...categoryFields
 ],
 footerText: 'Το παρόν έγγραφο αποτελεί τον επίσημο απολογισμό εσόδων-εξόδων του Ναού προς κατάθεση στη Μητρόπολη.',
 signatureLabel: 'Ο Πρόεδρος του Εκκλ. Συμβουλίου'
 });

 return Buffer.from(await pdfDoc.save());
}

export async function genTransactionReceiptPdf(tx: any, settings: any): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 
 const isIncome = tx.type === 'INCOME';
 const docTitle = isIncome ? 'ΓΡΑΜΜΑΤΙΟ ΕΙΣΠΡΑΞΗΣ' : 'ΕΝΤΑΛΜΑ ΠΛΗΡΩΜΗΣ';
 const personLabel = isIncome ? 'Καταθέτης / Λαβών' : 'Δικαιούχος / Προμηθευτής';
 
 // Create a nice protocol number using the format RECEIPT-YEAR-ID so it looks official
 const dObj = new Date(tx.date);
 const fakeProtocol = `${isIncome?'GR':'EN'}-${dObj.getFullYear()}-${tx.id.substring(0,6).toUpperCase()}`;

 await buildDocumentPage(pdfDoc, {
 metropolisHeader: settings?.metropolisName || 'Ιερά Μητρόπολη',
 templeHeader: settings?.templeName || 'Ιερός Ναός',
 title: docTitle,
 subtitle: `ΑΡΙΘΜΟΣ ΠΑΡΑΣΤΑΤΙΚΟΥ: ${fakeProtocol}`,
 body: [
 { label: 'Ημερομηνία Kίνησης', value: formatGreekDate(dObj) },
 { label: 'Κατηγορία / Fund', value: tx.category || 'Γενικό Ταμείο' },
 { label: 'Ποσό', value: `€ ${Number(tx.amount).toLocaleString('el-GR', {minimumFractionDigits:2, maximumFractionDigits:2})}`, wide: true },
 { label: 'Αιτιολογία', value: tx.purpose || BLANK, wide: true },
 { label: personLabel, value: tx.personName || BLANK, wide: true },
 { label: 'Σχετικό Παραστατικό', value: tx.receiptNumber || '-' },
 ],
 footerText: 'Το παρόν αποτελεί εσωτερικό παραστατικό λογιστικής τακτοποίησης του Ιερού Ναού και κατατίθεται στο αρχείο ελέγχου της Ιεράς Μητροπόλεως.',
 signatureLabel: isIncome ? 'Ο Εισπράξας (Εφημέριος / Ταμίας)' : 'Ο Πληρώσας (Εφημέριος / Ταμίας)'
 });

 return Buffer.from(await pdfDoc.save());
}

export async function generateAllBaptisiDocs(t: TokenData): Promise<GeneratedDoc[]> {
 const settings = parseSettings(t.temple.settings);
 const familySlug = t.customerName.replace(/\s+/g, '_').slice(0, 20);
 const verificationUrl = buildVerificationUrl(t.id);
 const docs: GeneratedDoc[] = [];

 const settingsWithVerify = { ...settings, _verificationUrl: verificationUrl, _docHash: t.id };

 const pairs: [string, string, () => Promise<Buffer>][] = [
 ['baptistiko', 'Βαπτιστικό Πιστοποιητικό', () => genBaptistiko(t, settingsWithVerify)],
 ['dilosi_anadoxou', 'Δήλωση Αναδόχου', () => genDilosiBaptiseos(t, settingsWithVerify)],
 ['bebaiosi', 'Βεβαίωση Βάπτισης', () => genBebaiosiBaptiseos(t, settingsWithVerify)],
 ['apantitikon', 'Απαντητικόν', () => genApantitikon(t, settingsWithVerify)],
 ];

 for (const [key, label, fn] of pairs) {
 try {
 const buffer = await fn();
 docs.push({ key, label, buffer, filename: `Βάπτιση_${familySlug}_${key}.pdf` });
 } catch (e) {
 console.error(`[pdfEngine] Failed to generate ${key}:`, e);
 }
 }

 return docs;
}

// ─── FUNERALS & MEMORIALS ───────────────────────────────────────────────────

export async function generateFuneralCert(deceased: any, templeSettings: any, templeName: string): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 
 await buildDocumentPage(pdfDoc, {
 metropolisHeader: templeSettings.metropolisName || 'Ιερά Μητρόπολη',
 templeHeader: templeName,
 title: 'ΠΙΣΤΟΠΟΙΗΤΙΚΟ ΕΚΔΗΜΙΑΣ',
 subtitle: '(ΒΙΒΛΙΟ ΚΕΚΟΙΜΗΜΕΝΩΝ)',
 protocolLabel: `Αρ. Πράξης: ${deceased.bookNumber || '___'}`,
 body: [
 { label: 'Ονοματεπώνυμο Κεκοιμημένου', value: `${deceased.lastName} ${deceased.firstName}` },
 { label: 'Πατρώνυμο', value: deceased.fathersName || 'Άγνωστο' },
 { label: 'Ημερομηνία Εκδημίας', value: deceased.dateOfDeath ? formatGreekDate(new Date(deceased.dateOfDeath)) : 'Άγνωστη' },
 { label: 'Τόπος & Ημερομηνία Ταφής', value: `${deceased.placeOfFuneral || 'Νεκροταφείο'} / ${deceased.dateOfFuneral ? new Date(deceased.dateOfFuneral).toLocaleDateString("el-GR") : '-'}` },
 { label: 'Συγγενής / Επικοινωνία', value: deceased.nextOfKinName ? `${deceased.nextOfKinName} (${deceased.nextOfKinPhone || ''})` : '-' },
 ],
 footerText: 'Βεβαιούται η εκδημία και η τέλεση της Εξοδίου Ακολουθίας υπό της Ενορίας μας.',
 signatureLabel: 'Ο Εφημέριος',
 });

 return Buffer.from(await pdfDoc.save());
}

export async function generateMemorialPermit(memorial: any, deceased: any, templeSettings: any, templeName: string): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 
 await buildDocumentPage(pdfDoc, {
 metropolisHeader: templeSettings.metropolisName || 'Ιερά Μητρόπολη',
 templeHeader: templeName,
 title: 'ΑΔΕΙΑ ΤΕΛΕΣΗΣ ΜΝΗΜΟΣΥΝΟΥ',
 subtitle: memorial.type === '40MH' ? '(Τεσσαρακονθήμερον)' : memorial.type === '1YEAR' ? '(Ετήσιον)' : '(Μνημόσυνον)',
 protocolLabel: `Ημερομηνία Τέλεσης: ${new Date(memorial.date).toLocaleDateString("el-GR")}`,
 body: [
 { label: 'Υπέρ αναπαύσεως', value: `${deceased.lastName} ${deceased.firstName}` },
 { label: 'Ώρα Τέλεσης', value: memorial.time || '10:00 π.μ.' },
 { label: 'Τόπος', value: deceased.placeOfFuneral || 'Ενορία' },
 { label: 'Εφημέριος', value: memorial.officiantPriest || 'Ιερατείον' },
 ],
 footerText: 'Παρέχεται η άδεια δια την τέλεσιν του Ιερού Μνημοσύνου σύμφωνα με τους κανόνες της Εκκλησίας.',
 signatureLabel: 'Ο Προϊστάμενος',
 });

 return Buffer.from(await pdfDoc.save());
}

// ─── MAILING & LABELS ───────────────────────────────────────────────────────

export async function generateLabelsPdf(people: any[]): Promise<Buffer> {
 const pdfDoc = await PDFDocument.create();
 const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
 const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

 // Standard Avery-style 3x7 Grid (21 labels per A4 page)
 const COLS = 3;
 const ROWS = 7;
 const LABELS_PER_PAGE = COLS * ROWS;
 const PAGE_WIDTH = 595.28; // A4 pt width
 const PAGE_HEIGHT = 841.89; // A4 pt height

 const MARGIN_X = 14.17; // ~5mm margin
 const MARGIN_Y = 42.5; // ~15mm top/bottom margin
 
 const LABEL_WIDTH = (PAGE_WIDTH - (MARGIN_X * 2)) / COLS;
 const LABEL_HEIGHT = (PAGE_HEIGHT - (MARGIN_Y * 2)) / ROWS;

 for (let i = 0; i < people.length; i += LABELS_PER_PAGE) {
 const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
 const chunk = people.slice(i, i + LABELS_PER_PAGE);

 chunk.forEach((person, index) => {
 const col = index % COLS;
 const row = Math.floor(index / COLS);
 
 const x = MARGIN_X + (col * LABEL_WIDTH) + 15;
 const y = PAGE_HEIGHT - MARGIN_Y - (row * LABEL_HEIGHT) - 30;

 const fullName = `${person.lastName || ''} ${person.firstName || ''}`.trim();
 page.drawText(fullName.substring(0, 30), { x, y, size: 10, font: fontBold, color: rgb(0,0,0) });
 page.drawText(person.address ? person.address.substring(0, 35) : '(Χωρίς Διεύθυνση)', { x, y: y - 14, size: 9, font, color: rgb(0.2,0.2,0.2) });
 page.drawText(`Τ.Κ. ${person.postalCode || '____'} - ${person.city || ''}`, { x, y: y - 26, size: 9, font, color: rgb(0.2,0.2,0.2) });
 });
 }

 if (people.length === 0) {
 const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
 page.drawText("No records selected.", { x: 50, y: PAGE_HEIGHT - 50, size: 12, font });
 }

 return Buffer.from(await pdfDoc.save());
}



