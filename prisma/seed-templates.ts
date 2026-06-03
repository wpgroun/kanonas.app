/**
 * CAMOS Ecclesiastical Document Templates Seed
 * Run: npx ts-node prisma/seed-templates.ts
 * 
 * Creates global DocTemplate records (templeId=null) with HTML content
 * containing {{VARIABLE}} placeholders that the docEngine fills dynamically.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TEMPLATES = [
  // ═══════════════════════════════════════════
  // ΓΑΜΟΣ — 14 Έντυπα
  // ═══════════════════════════════════════════
  {
    docType: 'GAMOS',
    nameEl: 'Πιστοποιητικό Αγαμίας Τύπου Α',
    context: 'agamia_a',
    htmlContent: `<h2 style="text-align:center">ΠΙΣΤΟΠΟΙΗΤΙΚΟΝ ΑΓΑΜΙΑΣ<br/><small>(Τύπος Α — Υπογραφή Εφημερίου)</small></h2>
<p>Ο υπογεγραμμένος Εφημέριος του Ιερού Ναού <strong>{{TEMPLE_NAME}}</strong>, της Ιεράς Μητροπόλεως <strong>{{METROPOLIS_NAME}}</strong>,</p>
<p>Πιστοποιώ ότι ο/η <strong>{{FULL_NAME}}</strong>, τέκνον <strong>{{FATHER_NAME}}</strong> και <strong>{{MOTHER_NAME}}</strong>, γεννηθείς/γεννηθείσα την <strong>{{BIRTH_DATE}}</strong>, βαπτισθείς/βαπτισθείσα εις τον Ιερόν Ναόν <strong>{{BAPTISM_CHURCH}}</strong>, ΔΕΝ τέλεσε Ιερόν Μυστήριον Γάμου κατά τους σωζομένους εκκλησιαστικούς κώδικας.</p>
<p>Εκδίδεται τη αιτήσει του/της ενδιαφερομένου/ης για κάθε νόμιμη χρήση.</p>
<p style="margin-top:2cm"><strong>Ημερομηνία:</strong> {{ISSUE_DATE}}</p>
<p><strong>Αριθμός Πρωτοκόλλου:</strong> {{PROTOCOL_NUMBER}}</p>
<div style="text-align:right;margin-top:2cm"><strong>Ο Εφημέριος</strong><br/><br/><br/>{{PRIEST_NAME}}</div>`
  },
  {
    docType: 'GAMOS',
    nameEl: 'Πιστοποιητικό Αγαμίας Τύπου Β',
    context: 'agamia_b',
    htmlContent: `<h2 style="text-align:center">ΠΙΣΤΟΠΟΙΗΤΙΚΟΝ ΑΓΑΜΙΑΣ<br/><small>(Τύπος Β — Εφημέριος + 2 Μάρτυρες + ΥΔ)</small></h2>
<p>Ο υπογεγραμμένος Εφημέριος του Ιερού Ναού <strong>{{TEMPLE_NAME}}</strong>, της Ιεράς Μητροπόλεως <strong>{{METROPOLIS_NAME}}</strong>,</p>
<p>Πιστοποιώ, μετά και μαρτυρίαν δύο αξιοπίστων μαρτύρων, ότι ο/η <strong>{{FULL_NAME}}</strong>, τέκνον <strong>{{FATHER_NAME}}</strong> και <strong>{{MOTHER_NAME}}</strong>, ΔΕΝ τέλεσε Ιερόν Μυστήριον Γάμου.</p>
<p style="margin-top:1cm"><strong>Α' Μάρτυς:</strong> {{WITNESS_1_NAME}} — ΑΔΤ: {{WITNESS_1_ID}}</p>
<p><strong>Β' Μάρτυς:</strong> {{WITNESS_2_NAME}} — ΑΔΤ: {{WITNESS_2_ID}}</p>
<p style="margin-top:1cm"><strong>Αρ. Πρωτ.:</strong> {{PROTOCOL_NUMBER}} | <strong>Ημ/νία:</strong> {{ISSUE_DATE}}</p>
<div style="display:flex;justify-content:space-between;margin-top:2cm">
<div style="text-align:center"><strong>Α' Μάρτυς</strong><br/><br/><br/>(Υπογραφή)</div>
<div style="text-align:center"><strong>Ο Εφημέριος</strong><br/><br/><br/>{{PRIEST_NAME}}</div>
<div style="text-align:center"><strong>Β' Μάρτυς</strong><br/><br/><br/>(Υπογραφή)</div>
</div>`
  },
  {
    docType: 'GAMOS',
    nameEl: 'Υπεύθυνη Δήλωση Αγαμίας',
    context: 'yd_agamia',
    htmlContent: `<h2 style="text-align:center">ΥΠΕΥΘΥΝΗ ΔΗΛΩΣΗ<br/><small>(Άρθρο 8 Ν.1599/1986)</small></h2>
<p>Ο/Η κάτωθι υπογεγραμμένος/η <strong>{{FULL_NAME}}</strong>, του <strong>{{FATHER_NAME}}</strong>, κάτοικος <strong>{{ADDRESS}}</strong>, με ΑΔΤ <strong>{{ID_NUMBER}}</strong>,</p>
<p>Δηλώνω υπεύθυνα ότι:</p>
<p>Είμαι {{MARITAL_STATUS}} και δεν έχω τελέσει Ιερόν Μυστήριον Γάμου ή Πολιτικόν Γάμον. Εάν η δήλωσή μου αποδειχθεί ψευδής, υπέχω τις ποινικές κυρώσεις του Νόμου.</p>
<p style="margin-top:2cm;text-align:right">Ημερομηνία: {{ISSUE_DATE}}<br/><br/>Ο/Η Δηλών/Δηλούσα<br/><br/><br/>(Υπογραφή)</p>`
  },
  {
    docType: 'GAMOS',
    nameEl: 'Αίτηση Ελευθερογαμίας προς Ι.Μ.',
    context: 'aitisi_eleftherogamias',
    htmlContent: `<h2 style="text-align:center">ΑΙΤΗΣΗ ΧΟΡΗΓΗΣΕΩΣ<br/>ΠΙΣΤΟΠΟΙΗΤΙΚΟΥ ΕΛΕΥΘΕΡΟΓΑΜΙΑΣ</h2>
<p style="text-align:right">Προς: Ιεράν Μητρόπολιν <strong>{{METROPOLIS_NAME}}</strong></p>
<p>Σεβασμιώτατε,</p>
<p>Ο/Η αιτών/αιτούσα <strong>{{FULL_NAME}}</strong>, ενορίτης/τρια του Ι.Ν. <strong>{{TEMPLE_NAME}}</strong>, παρακαλώ όπως μου χορηγηθεί Πιστοποιητικόν Ελευθερογαμίας, καθότι προτίθεμαι να τελέσω γάμον μετά του/της <strong>{{SPOUSE_NAME}}</strong> εις Ι.Ν. <strong>{{TARGET_CHURCH}}</strong> της Ι.Μ. <strong>{{TARGET_METROPOLIS}}</strong>.</p>
<p><strong>Αρ. Πρωτ.:</strong> {{PROTOCOL_NUMBER}} | <strong>Ημ/νία:</strong> {{ISSUE_DATE}}</p>`
  },
  {
    docType: 'GAMOS',
    nameEl: 'Αίτηση Γάμου',
    context: 'aitisi_gamou',
    htmlContent: `<h2 style="text-align:center">ΑΙΤΗΣΗ ΤΕΛΕΣΕΩΣ ΓΑΜΟΥ</h2>
<p style="text-align:right">Προς: Ι.Ν. <strong>{{TEMPLE_NAME}}</strong></p>
<table style="width:100%;border-collapse:collapse"><tr><td style="border:1px solid #999;padding:8px" colspan="2"><strong>ΝΥΜΦΙΟΣ</strong></td></tr>
<tr><td style="border:1px solid #ccc;padding:6px;width:30%">Ονοματεπώνυμο:</td><td style="border:1px solid #ccc;padding:6px"><strong>{{GROOM_NAME}}</strong></td></tr>
<tr><td style="border:1px solid #ccc;padding:6px">Πατρώνυμο:</td><td style="border:1px solid #ccc;padding:6px">{{GROOM_FATHER}}</td></tr>
<tr><td style="border:1px solid #ccc;padding:6px">Κατάσταση:</td><td style="border:1px solid #ccc;padding:6px">{{GROOM_STATUS}}</td></tr>
<tr><td style="border:1px solid #999;padding:8px" colspan="2"><strong>ΝΥΜΦΗ</strong></td></tr>
<tr><td style="border:1px solid #ccc;padding:6px">Ονοματεπώνυμο:</td><td style="border:1px solid #ccc;padding:6px"><strong>{{BRIDE_NAME}}</strong></td></tr>
<tr><td style="border:1px solid #ccc;padding:6px">Πατρώνυμο:</td><td style="border:1px solid #ccc;padding:6px">{{BRIDE_FATHER}}</td></tr>
<tr><td style="border:1px solid #ccc;padding:6px">Κατάσταση:</td><td style="border:1px solid #ccc;padding:6px">{{BRIDE_STATUS}}</td></tr>
<tr><td style="border:1px solid #999;padding:8px" colspan="2"><strong>ΠΑΡΑΝΥΜΦΟΣ</strong></td></tr>
<tr><td style="border:1px solid #ccc;padding:6px">Ονοματεπώνυμο:</td><td style="border:1px solid #ccc;padding:6px">{{KOUMPAROS_NAME}}</td></tr></table>
<p><strong>Ημ/νία Τέλεσης:</strong> {{CEREMONY_DATE}}</p>`
  },
  {
    docType: 'GAMOS',
    nameEl: 'Δήλωση Κοινού Επωνύμου Τέκνων',
    context: 'dilosi_eponymou',
    htmlContent: `<h2 style="text-align:center">ΔΗΛΩΣΗ ΚΟΙΝΟΥ ΕΠΩΝΥΜΟΥ ΤΕΚΝΩΝ</h2>
<p>Οι κάτωθι υπογεγραμμένοι σύζυγοι:</p>
<p><strong>Σύζυγος:</strong> {{GROOM_NAME}}, πατρώνυμο {{GROOM_FATHER}}</p>
<p><strong>Σύζυγος:</strong> {{BRIDE_NAME}}, πατρώνυμο {{BRIDE_FATHER}}</p>
<p>Δηλώνουμε ότι τα τέκνα μας θα φέρουν το επώνυμο: <strong>{{CHOSEN_SURNAME}}</strong></p>
<p style="margin-top:2cm;display:flex;justify-content:space-around"><span>Ο Σύζυγος<br/><br/>(Υπογραφή)</span><span>Η Σύζυγος<br/><br/>(Υπογραφή)</span></p>`
  },
  {
    docType: 'GAMOS',
    nameEl: 'Δήλωση Τέλεσης Θρησκευτικού Γάμου',
    context: 'dilosi_teleseos',
    htmlContent: `<h2 style="text-align:center">ΔΗΛΩΣΙΣ ΤΕΛΕΣΕΩΣ<br/>ΘΡΗΣΚΕΥΤΙΚΟΥ ΓΑΜΟΥ</h2>
<p>Δηλώνεται ότι την <strong>{{CEREMONY_DATE}}</strong> ετελέσθη ο γάμος:</p>
<p><strong>Νυμφίου:</strong> {{GROOM_NAME}}, τέκνου {{GROOM_FATHER}}</p>
<p><strong>Νύμφης:</strong> {{BRIDE_NAME}}, τέκνου {{BRIDE_FATHER}}</p>
<p><strong>Παρανύμφου:</strong> {{KOUMPAROS_NAME}}</p>
<p><strong>Ιεροτελεστήσαντος:</strong> {{PRIEST_NAME}}</p>
<p><strong>Αρ. Βιβλίου Γάμων:</strong> {{BOOK_NUMBER}} | <strong>Αρ. Πρωτ.:</strong> {{PROTOCOL_NUMBER}}</p>`
  },
  {
    docType: 'GAMOS',
    nameEl: 'Πιστοποιητικό Τελέσεως Γάμου',
    context: 'pistopoiitiko_gamou',
    htmlContent: `<h2 style="text-align:center">ΠΙΣΤΟΠΟΙΗΤΙΚΟΝ ΤΕΛΕΣΕΩΣ ΓΑΜΟΥ</h2>
<p>Πιστοποιείται ότι εις τον Ι.Ν. <strong>{{TEMPLE_NAME}}</strong> ετελέσθη κατά τους Ιερούς Κανόνας ο γάμος μεταξύ:</p>
<p><strong>Νυμφίου:</strong> {{GROOM_NAME}} ({{GROOM_FATHER}})</p>
<p><strong>Νύμφης:</strong> {{BRIDE_NAME}} ({{BRIDE_FATHER}})</p>
<p><strong>Ημ/νία:</strong> {{CEREMONY_DATE}} | <strong>Αρ. Βιβλ.:</strong> {{BOOK_NUMBER}} | <strong>Πρωτ.:</strong> {{PROTOCOL_NUMBER}}</p>`
  },
  {
    docType: 'GAMOS',
    nameEl: 'Βεβαίωση Γάμου (Σύζυγος)',
    context: 'veveosi_gamou_m',
    htmlContent: `<h2 style="text-align:center">ΒΕΒΑΙΩΣΙΣ ΓΑΜΟΥ</h2>
<p>Βεβαιούται ότι ο <strong>{{GROOM_NAME}}</strong> ετέλεσε θρησκευτικόν γάμον μετά της <strong>{{BRIDE_NAME}}</strong> εις τον Ι.Ν. <strong>{{TEMPLE_NAME}}</strong> την <strong>{{CEREMONY_DATE}}</strong>.</p>
<p><strong>Αρ. Βιβλίου:</strong> {{BOOK_NUMBER}} | <strong>Αρ. Πρωτ.:</strong> {{PROTOCOL_NUMBER}}</p>`
  },
  {
    docType: 'GAMOS',
    nameEl: 'Βεβαίωση Γάμου (Σύζυγο)',
    context: 'veveosi_gamou_f',
    htmlContent: `<h2 style="text-align:center">ΒΕΒΑΙΩΣΙΣ ΓΑΜΟΥ</h2>
<p>Βεβαιούται ότι η <strong>{{BRIDE_NAME}}</strong> ετέλεσε θρησκευτικόν γάμον μετά του <strong>{{GROOM_NAME}}</strong> εις τον Ι.Ν. <strong>{{TEMPLE_NAME}}</strong> την <strong>{{CEREMONY_DATE}}</strong>.</p>
<p><strong>Αρ. Βιβλίου:</strong> {{BOOK_NUMBER}} | <strong>Αρ. Πρωτ.:</strong> {{PROTOCOL_NUMBER}}</p>`
  },
  {
    docType: 'GAMOS',
    nameEl: 'Γνωστοποίηση Μέλλοντος Γάμου',
    context: 'gnostopoiisi_gamou',
    htmlContent: `<h2 style="text-align:center">ΓΝΩΣΤΟΠΟΙΗΣΙΣ ΜΕΛΛΟΝΤΟΣ ΓΑΜΟΥ</h2>
<p>Γνωστοποιείται ότι πρόκειται να τελεσθή Γάμος μεταξύ:</p>
<p><strong>{{GROOM_NAME}}</strong> ({{GROOM_STATUS}}) και <strong>{{BRIDE_NAME}}</strong> ({{BRIDE_STATUS}})</p>
<p><strong>Ημ/νία:</strong> {{CEREMONY_DATE}} | <strong>Ι.Ν.:</strong> {{TEMPLE_NAME}}</p>
<p>Όστις γνωρίζει κώλυμα, ας το γνωστοποιήσει εις τον Ι.Ν.</p>`
  },

  // ═══════════════════════════════════════════
  // ΒΑΠΤΙΣΗ — 10 Έντυπα
  // ═══════════════════════════════════════════
  {
    docType: 'VAPTISI',
    nameEl: 'Δήλωση Βαπτίσεως',
    context: 'dilosi_vaptisis',
    htmlContent: `<h2 style="text-align:center">ΔΗΛΩΣΙΣ ΒΑΠΤΙΣΕΩΣ</h2>
<p>Δηλούται ότι εις τον Ι.Ν. <strong>{{TEMPLE_NAME}}</strong> εβαπτίσθη σήμερον <strong>{{CEREMONY_DATE}}</strong> το τέκνον:</p>
<p><strong>Βαπτιστικό Όνομα:</strong> {{CHILD_NAME}}</p>
<p><strong>Πατρός:</strong> {{FATHER_NAME}} | <strong>Μητρός:</strong> {{MOTHER_NAME}}</p>
<p><strong>Ανάδοχος:</strong> {{GODPARENT_NAME}}</p>
<p><strong>Ιεροτελεστήσας:</strong> {{PRIEST_NAME}}</p>
<p><strong>Αρ. Βιβλ. Βαπτ.:</strong> {{BOOK_NUMBER}} | <strong>Αρ. Πρωτ.:</strong> {{PROTOCOL_NUMBER}}</p>
<p style="font-style:italic;font-size:10pt;margin-top:1cm">Η παρούσα δήλωσις εκδίδεται μόνον άπαξ.</p>`
  },
  {
    docType: 'VAPTISI',
    nameEl: 'Αντίγραφο Δηλώσεως Βαπτίσεως',
    context: 'antigrafo_vaptisis',
    htmlContent: `<h2 style="text-align:center">ΑΝΤΙΓΡΑΦΟΝ ΔΗΛΩΣΕΩΣ ΒΑΠΤΙΣΕΩΣ</h2>
<p>Βεβαιούται ότι εις τον Ι.Ν. <strong>{{TEMPLE_NAME}}</strong> εβαπτίσθη την <strong>{{CEREMONY_DATE}}</strong>:</p>
<p><strong>{{CHILD_NAME}}</strong>, τέκνον {{FATHER_NAME}} και {{MOTHER_NAME}}</p>
<p><strong>Ανάδοχος:</strong> {{GODPARENT_NAME}}</p>
<p><strong>Αρ. Βιβλ.:</strong> {{BOOK_NUMBER}} | <strong>Πρωτ.:</strong> {{PROTOCOL_NUMBER}}</p>`
  },
  {
    docType: 'VAPTISI',
    nameEl: 'Αίτηση Βάπτισης Ετεροδόξου → Ι.Μ.',
    context: 'aitisi_eterodoxou',
    htmlContent: `<h2 style="text-align:center">ΑΙΤΗΣΙΣ ΒΑΠΤΙΣΕΩΣ ΕΤΕΡΟΔΟΞΟΥ</h2>
<p style="text-align:right">Προς: Ιεράν Μητρόπολιν <strong>{{METROPOLIS_NAME}}</strong></p>
<p>Σεβασμιώτατε,</p>
<p>Ο/Η <strong>{{FULL_NAME}}</strong>, υπήκοος <strong>{{NATIONALITY}}</strong>, θρησκεύματος <strong>{{CURRENT_RELIGION}}</strong>, επιθυμεί να κατηχηθεί και να βαπτισθεί Ορθόδοξος Χριστιανός/ή.</p>
<p>Παρακαλώ όπως εγκρίνετε και ορίσετε Κατηχητήν Ιερέα.</p>
<p><strong>Αρ. Πρωτ.:</strong> {{PROTOCOL_NUMBER}}</p>`
  },
  {
    docType: 'VAPTISI',
    nameEl: 'Άδεια Παραχώρησης Βαπτίσεως',
    context: 'paraxorisi_vaptisis',
    htmlContent: `<h2 style="text-align:center">ΑΔΕΙΑ ΠΑΡΑΧΩΡΗΣΕΩΣ ΒΑΠΤΙΣΕΩΣ</h2>
<p>Ο Ι.Ν. <strong>{{SOURCE_TEMPLE}}</strong> παραχωρεί άδεια τέλεσης της Βαπτίσεως του τέκνου:</p>
<p><strong>{{CHILD_NAME}}</strong>, τέκνον {{FATHER_NAME}} και {{MOTHER_NAME}}</p>
<p>Προς τέλεση εις τον Ι.Ν. <strong>{{TARGET_TEMPLE}}</strong>.</p>
<p>Μετά την τέλεση, ο Ναός τέλεσης υποχρεούται να γνωστοποιήσει τούτο.</p>
<p><strong>Αρ. Πρωτ.:</strong> {{PROTOCOL_NUMBER}} | <strong>Ημ/νία:</strong> {{ISSUE_DATE}}</p>`
  },
  {
    docType: 'VAPTISI',
    nameEl: 'Βεβαίωση Βαπτίσεως',
    context: 'veveosi_vaptisis',
    htmlContent: `<h2 style="text-align:center">ΒΕΒΑΙΩΣΙΣ ΒΑΠΤΙΣΕΩΣ</h2>
<p>Βεβαιούται ότι εις τον Ι.Ν. <strong>{{TEMPLE_NAME}}</strong> εβαπτίσθη:</p>
<p><strong>{{CHILD_NAME}}</strong> ({{FATHER_NAME}} + {{MOTHER_NAME}})</p>
<p><strong>Ανάδοχος:</strong> {{GODPARENT_NAME}} | <strong>Ημ/νία:</strong> {{CEREMONY_DATE}}</p>
<p><strong>Αρ. Βιβλ.:</strong> {{BOOK_NUMBER}} | <strong>Πρωτ.:</strong> {{PROTOCOL_NUMBER}}</p>`
  },

  // ═══════════════════════════════════════════
  // ΓΕΝΙΚΑ
  // ═══════════════════════════════════════════
  {
    docType: 'ALLO',
    nameEl: 'Υπεύθυνη Δήλωση (Γενική)',
    context: 'yd_geniki',
    htmlContent: `<h2 style="text-align:center">ΥΠΕΥΘΥΝΗ ΔΗΛΩΣΗ<br/><small>(Άρθρο 8 Ν.1599/1986)</small></h2>
<p>Ο/Η κάτωθι υπογεγραμμένος/η <strong>{{FULL_NAME}}</strong>, του <strong>{{FATHER_NAME}}</strong>, με ΑΔΤ <strong>{{ID_NUMBER}}</strong>,</p>
<p>Δηλώνω ότι: {{DECLARATION_TEXT}}</p>
<p style="margin-top:2cm;text-align:right">Ημερομηνία: {{ISSUE_DATE}}<br/><br/>(Υπογραφή)</p>`
  },
];

async function seed() {
  console.log('Seeding CAMOS templates...');
  
  let created = 0;
  let skipped = 0;
  
  for (const tpl of TEMPLATES) {
    const exists = await prisma.docTemplate.findFirst({
      where: { templeId: null, context: tpl.context }
    });
    
    if (exists) {
      skipped++;
      continue;
    }
    
    await prisma.docTemplate.create({
      data: {
        templeId: null, // Global SaaS template
        docType: tpl.docType,
        nameEl: tpl.nameEl,
        context: tpl.context,
        htmlContent: tpl.htmlContent,
      }
    });
    created++;
  }
  
  console.log(`Done! Created: ${created}, Skipped: ${skipped}`);
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
