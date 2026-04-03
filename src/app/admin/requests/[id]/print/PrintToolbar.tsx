'use client';
import { Button } from '@/components/ui/button';
import { FileText, Printer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PrintToolbar({ tokenId }: { tokenId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownloadDocx = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Αποτυχία δημιουργίας εγγράφου');
      }

      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${tokenId.slice(-6)}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('Το έγγραφο Word (.docx) 	κατέβηκε επιτυχώς!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Πρόβλημα κατά την λήψη του αρχείου. Ελέγξτε αν υπάρχει το template.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex gap-3 print:hidden backdrop-blur-md bg-background/80 p-4 rounded-xl border border-border shadow-xl">
      <Button variant="outline" size="lg" onClick={() => window.print()}>
        <Printer className="w-5 h-5 mr-2" />
        Εκτύπωση Web
      </Button>
      <Button size="lg" onClick={handleDownloadDocx} disabled={loading}>
        <FileText className="w-5 h-5 mr-2" />
        {loading ? 'Δημιουργία...' : 'Λήψη Word (.docx)'}
      </Button>
    </div>
  );
}
