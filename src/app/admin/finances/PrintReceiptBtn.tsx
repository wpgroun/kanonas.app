'use client';

import { useState } from 'react';
import { Printer, Loader2 } from 'lucide-react';
import { downloadReceiptAction } from '@/actions/finances';

export default function PrintReceiptBtn({ tx }: { tx: any }) {
 const [loading, setLoading] = useState(false);

 const handlePrint = async () => {
 setLoading(true);
 try {
 const res = await downloadReceiptAction(tx);
 if (!res.success || !res.pdfBase64) {
 alert(res.error || 'Σφάλμα παραγωγής PDF');
 return;
 }
 
 const linkSource = `data:application/pdf;base64,${res.pdfBase64}`;
 const downloadLink = document.createElement("a");
 downloadLink.href = linkSource;
 
 const typeStr = tx.type === 'INCOME' ? 'Είσπραξης' : 'Πληρωμής';
 downloadLink.download = `Γραμμάτιο_${typeStr}_${tx.id.substring(0,6).toUpperCase()}.pdf`;
 downloadLink.click();
 
 } catch (e) {
 alert('Network error');
 } finally {
 setLoading(false);
 }
 };

 return (
 <button 
 onClick={handlePrint}
 disabled={loading}
 className={`p-2 rounded-lg transition-colors flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
 title="Εκτύπωση Παραστατικού"
 >
 {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Printer className="w-4 h-4"/>}
 </button>
);
}
