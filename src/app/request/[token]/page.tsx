import { verifyTokenByHash } from '@/actions/sacraments'
import FormClient from './FormClient'
import { redirect } from 'next/navigation'

export default async function PublicRequestPage({ params }: { params: { token: string } }) {
  const { token: tokenStr } = await params;
  
  // Verify token
  const token = await verifyTokenByHash(tokenStr);
  
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center max-w-md w-full">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-foreground mb-2">Μη Εγκυρος Σύνδεσμος</h1>
          <p className="text-muted-foreground">Ο σύνδεσμος που ακολουθήσατε έχει λήξει ή δεν είναι έγκυρος. Παρακαλούμε επικοινωνήστε με την ενορία σας.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="bg-primary/5 border-b border-border/50 py-12 mb-8 text-center text-foreground flex flex-col items-center">
         <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center text-2xl shadow-sm mb-4 border border-border">
           🏛️
         </div>
         <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
           {token.temple?.name || 'Ορθόδοξος Ναός'}
         </h1>
         <p className="text-muted-foreground max-w-2xl px-4">
           Αγαπητοί αδελφοί, καλώς ήλθατε στο σύστημα ηλεκτρονικής καταχώρησης στοιχείων. 
           Παρακαλούμε συμπληρώστε με ακρίβεια την παρακάτω φόρμα για την έκδοση των απαραίτητων πιστοποιητικών.
         </p>
      </div>
      
      <div className="max-w-3xl mx-auto px-4">
        <FormClient token={token} />
      </div>
    </div>
  )
}
