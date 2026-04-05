import { getRequestDetails, getTempleSettings } from '../../../../actions'
import QRCode from 'react-qr-code'
import PrintToolbar from './PrintToolbar'

export default async function CertificatePrintPage({ params }: { params: { id: string } }) {
 const { id } = await params;
 const token = await getRequestDetails(id);
 const settings = await getTempleSettings();

 if (!token) return <div>Το αίτημα δεν βρέθηκε.</div>;

 const isGamos = token.serviceType === 'GAMOS';
 const templeName = settings.name || 'Ενοριακός Ναός';
 const metropolisName = settings.metropolisName || 'Ιερά Μητρόπολις';
 const todayGr = new Date().toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' });

 // Verification URL
 // We use localhost for dev, but in prod this would be the actual domain
 const verificationUrl = `http://localhost:3000/verify/${token.tokenStr}`;

 return (
 <>
 <PrintToolbar tokenId={token.id} />
 
 <style dangerouslySetInnerHTML={{__html: `
 @page { size: A4 portrait; margin: 2cm; }
 body {
 font-family: 'Palatino Linotype', 'Book Antiqua', 'Palatino', Georgia, serif;
 font-size: 14pt;
 color: #1a1008;
 background: #eef2f6;
 margin: 0; padding: 0;
 line-height: 1.6;
 display: flex;
 justify-content: center;
 }
 @media print {
 body { background: #fff; }
 }
 .cert-container {
 border: 2px solid #bba070;
 padding: 2cm;
 min-height: 25cm;
 width: 21cm;
 background: #fff;
 position: relative;
 box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
 margin: 2cm 0;
 }
 @media print {
 .cert-container { margin: 0; border: none; box-shadow: none; width: auto; }
 }
 .cert-header {
 text-align: center;
 border-bottom: 2px solid #bba070;
 padding-bottom: 1cm;
 margin-bottom: 1cm;
 }
 .cert-header h4 { margin: 0; font-size: 14pt; font-weight: normal; color: #555; }
 .cert-header h2 { margin: 0.2cm 0; font-size: 18pt; font-weight: bold; color: #1a1008; }
 .cert-title {
 text-align: center;
 font-size: 24pt;
 font-weight: bold;
 color: #8b2e20;
 margin: 1cm 0;
 letter-spacing: 0.1em;
 }
 .cert-body { text-align: justify; }
 .cert-footer {
 margin-top: 3cm;
 display: flex;
 justify-content: space-between;
 align-items: flex-end;
 }
 .qr-box {
 text-align: center;
 font-size: 9pt;
 color: #555;
 }
 `}} />

 <div className="cert-container">
 {/* Υδατογράφημα (Optional) */}
 <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, fontSize: '300pt', zIndex: 0 }}>☦</div>

 <div className="cert-header"style={{ position: 'relative', zIndex: 10 }}>
 <h4>{metropolisName}</h4>
 <h2>{templeName}</h2>
 <div style={{ fontSize: '11pt', marginTop: '0.5cm' }}>
 Αριθ. Πρωτοκόλλου: {token.protocolNumber || 'ΕΚΚΡΕΜΕΙ'} <br/>
 Ημερομηνία: {todayGr}
 </div>
 </div>

 <div className="cert-title"style={{ position: 'relative', zIndex: 10 }}>
 ΠΙΣΤΟΠΟΙΗΤΙΚΟ {isGamos ? 'ΓΑΜΟΥ' : 'ΒΑΠΤΙΣΕΩΣ'}
 </div>

 <div className="cert-body"style={{ position: 'relative', zIndex: 10 }}>
 Πιστοποιείται δι' αρχιερατικού κύρους ότι την <strong>{token.ceremonyDate ? new Date(token.ceremonyDate).toLocaleDateString('el-GR') : '________'}</strong> ετελέσθη εις τον Ιερόν ημών Ναόν το Μυστήριον {isGamos ? 'του Γάμου' : 'της Βαπτίσεως'} της οικογενείας <strong>{token.customerName}</strong>.
 <br/><br/>
 Το παρόν έγγραφον εκδίδεται ψηφιακά και φέρει μοναδικό κρυπτογραφικό κώδικα (QR) προς επαλήθευση της γνησιότητάς του υπό των αρμοδίων αρχών.
 <br/><br/>
 (Τα πλήρη στοιχεία καταχωρηθέντων προσώπων αντλούνται από το ψηφιακό Μητρώο. Αναγνωριστικό εγγραφής: #{token.id.slice(-6).toUpperCase()})
 </div>

 <div className="cert-footer"style={{ position: 'relative', zIndex: 10 }}>
 <div className="qr-box">
 <div style={{ border: '1px solid #ddd', padding: '0.5cm', background: '#fff', display: 'inline-block' }}>
 <QRCode value={verificationUrl} size={100} />
 </div>
 <div style={{ marginTop: '0.2cm' }}>Σαρώστε για επαλήθευση</div>
 </div>

 <div style={{ textAlign: 'center' }}>
 Ο Εφημέριος
 <br/><br/><br/><br/>
 {token.assignedPriest || '(Υπογραφή)'}
 </div>
 </div>
 </div>
 </>
)
}
