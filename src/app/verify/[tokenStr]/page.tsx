import { verifyTokenByHash } from '@/actions/sacraments'
import Link from 'next/link'

export default async function PublicVerifyPage({ params }: { params: { tokenStr: string } }) {
  const { tokenStr } = await params;
  const token = await verifyTokenByHash(tokenStr);

  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f4f0', fontFamily: 'system-ui, sans-serif' }}>
         <div style={{ background: '#fff', padding: '3rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h1 style={{ color: '#dc2626', fontSize: '1.5rem', marginBottom: '1rem' }}>Μη Έγκυρο Έγγραφο</h1>
            <p style={{ color: '#666', lineHeight: 1.6 }}>Το πιστοποιητικό που σαρώσατε δεν βρέθηκε στο διαδικτυακό Μητρώο. Ενδέχεται να είναι πλαστό ή να έχει αποσυρθεί.</p>
         </div>
      </div>
    );
  }

  // Find Protocol number dynamically if possible (for simplicity we just show pending if not set)
  // In our DB, we didn't attach protocol number directly to Token yet, but the status is enough to verify authenticity.
  const isGamos = token.serviceType === 'GAMOS';
  const isValid = token.status === 'docs_generated';

  if (!isValid) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f4f0', fontFamily: 'system-ui, sans-serif' }}>
         <div style={{ background: '#fff', padding: '3rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ color: '#d97706', fontSize: '1.5rem', marginBottom: '1rem' }}>Εκκρεμής Έκδοση</h1>
            <p style={{ color: '#666', lineHeight: 1.6 }}>Το έγγραφο έχει καταχωρηθεί (Αναγνωριστικό: {token.id.slice(-6).toUpperCase()}) αλλά δεν έχει λάβει ακόμη επίσημο αριθμό Πρωτοκόλλου από τον Ναό.</p>
         </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f4f0', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        
        {/* Header */}
        <div style={{ background: '#059669', color: '#fff', padding: '2rem', textAlign: 'center' }}>
           <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', lineHeight: 1 }}>✅</div>
           <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 600 }}>Γνήσιο Έγγραφο</h1>
           <p style={{ opacity: 0.9, marginTop: '0.5rem', fontSize: '1rem' }}>Επιβεβαιώθηκε από το Εθνικό Μητρώο</p>
        </div>

        {/* Info */}
        <div style={{ padding: '2.5rem' }}>
           
           <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
             <h2 style={{ color: '#1a1008', fontSize: '1.2rem', marginBottom: '0.2rem' }}>{token.temple.name}</h2>
             <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>{token.temple.city}</p>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0e9df', paddingBottom: '0.8rem' }}>
                <span style={{ color: '#888' }}>Είδος Πράξης:</span>
                <span style={{ fontWeight: 600, color: '#111' }}>{isGamos ? 'Πιστοποιητικό Γάμου' : 'Πιστοποιητικό Βάπτισης'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0e9df', paddingBottom: '0.8rem' }}>
                <span style={{ color: '#888' }}>Οικογένεια / Τέκνο:</span>
                <span style={{ fontWeight: 600, color: '#111' }}>{token.customerName}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0e9df', paddingBottom: '0.8rem' }}>
                <span style={{ color: '#888' }}>Ημερομηνία Τέλεσης:</span>
                <span style={{ fontWeight: 600, color: '#111' }}>{token.ceremonyDate ? new Date(token.ceremonyDate).toLocaleDateString('el-GR') : '-'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0e9df', paddingBottom: '0.8rem' }}>
                <span style={{ color: '#888' }}>Αναγνωριστικό Συστήματος:</span>
                <span style={{ fontWeight: 600, color: '#111', fontFamily: 'monospace' }}>#{token.id.slice(-8).toUpperCase()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0e9df', paddingBottom: '0.8rem' }}>
                <span style={{ color: '#888' }}>Κατάσταση:</span>
                <span style={{ fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>Εγγεγραμμένο & Επίσημο</span>
              </div>

           </div>

           <div style={{ marginTop: '2.5rem', background: '#f8f4f0', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#666', borderLeft: '4px solid #bba070' }}>
              ℹ️ Το έγγραφο ανταποκρίνεται πλήρως στα ψηφιακά αρχεία του Ναού. Οποιαδήποτε απόκλιση μεταξύ σώματος του εγγράφου και της παρούσας οθόνης συνιστά πλαστογραφία.
           </div>

        </div>

      </div>

    </div>
  )
}
