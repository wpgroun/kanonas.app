'use client'

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileIcon, Trash2, FolderOpen, Download } from 'lucide-react';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

interface VaultPanelProps {
 templeId: string;
 parishionerId?: string;
 initialDocuments: any[];
}

export default function VaultPanel({ templeId, parishionerId, initialDocuments }: VaultPanelProps) {
 const [documents, setDocuments] = useState(initialDocuments);
 const [uploading, setUploading] = useState(false);
 const [docType, setDocType] = useState('TAUTOTITA');
 const [label, setLabel] = useState('');

 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 if (!e.target.files || e.target.files.length === 0) return;
 
 setUploading(true);
 const file = e.target.files[0];
 
 const formData = new FormData();
 formData.append('file', file);
 formData.append('templeId', templeId);
 if (parishionerId) formData.append('parishionerId', parishionerId);
 formData.append('docType', docType);
 formData.append('label', label || file.name);

 try {
 const response = await fetch('/api/vault/upload', {
 method: 'POST',
 body: formData,
 });

 if (!response.ok) throw new Error('Upload failed');
 const data = await response.json();
 
 if (data.success && data.document) {
 setDocuments(prev => [data.document, ...prev]);
 setLabel(''); // reset form
 }
 } catch (error) {
 console.error(error);
 alert('Σφάλμα κατά το ανέβασμα του αρχείου.');
 } finally {
 setUploading(false);
 }
 };

 return (
 <Card className="shadow-sm border-border/50">
 <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
 <CardTitle className="text-lg flex items-center gap-2">
 <FolderOpen className="w-5 h-5 text-primary"/>
 Αρχειοθήκη (Vault)
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-6 space-y-6">
 
 {/* Upload Form */}
 <div className="bg-muted/10 border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
 <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
 <UploadCloud className="w-6 h-6 text-primary"/>
 </div>
 <div>
 <p className="font-semibold text-foreground">Ανέβασμα Νέου Εγγράφου</p>
 <p className="text-xs text-muted-foreground mt-1 max-w-sm">
 Υποστηρίζονται αρχεία PDF και εικόνες για αποθήκευση στον φάκελο.
 </p>
 </div>
 
 <div className="flex flex-col sm:flex-row w-full max-w-lg gap-3 mt-4">
 <select 
 value={docType}
 onChange={e => setDocType(e.target.value)}
 className="data-input text-sm flex-1"
 >
 <option value="TAUTOTITA">Αστυνομική Ταυτότητα</option>
 <option value="DIAZEYKTIRIO">Διαζευκτήριο</option>
 <option value="PISTOPOIITIKO">Πιστοποιητικό Γέννησης / Αγάμιας</option>
 <option value="ALLO">Λοιπά Έγγραφα</option>
 </select>
 <input 
 type="text"
 placeholder="Αιτιολογία / Όνομα (προαιρετικό)"
 value={label}
 onChange={e => setLabel(e.target.value)}
 className="data-input text-sm flex-1"
 />
 </div>

 <div className="relative mt-2">
 <Button disabled={uploading}>
 {uploading ? 'Ανέβασμα...' : 'Επιλογή Αρχείου'}
 </Button>
 <input 
 type="file"
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
 onChange={handleFileUpload}
 disabled={uploading}
 accept="image/jpeg,image/png,application/pdf"
 />
 </div>
 </div>

 {/* Existing Documents */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {documents.map(doc => (
 <div key={doc.id} className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card hover:border-primary/40 transition-colors">
 <div className="bg-blue-50 p-3 rounded-lg flex-shrink-0">
 <FileIcon className="w-6 h-6 text-blue-600"/>
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-semibold text-sm truncate">{doc.label}</p>
 <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
 <span className="font-mono bg-muted px-1.5 rounded">{doc.docType}</span>
 <span>{format(new Date(doc.uploadedAt), 'dd/MM/yyyy HH:mm')}</span>
 <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
 </div>
 </div>
 <div className="flex flex-col gap-2 flex-shrink-0">
 <a href={doc.filePath} target="_blank"rel="noreferrer"className="text-muted-foreground hover:text-primary transition-colors">
 <Download className="w-4 h-4"/>
 </a>
 <button className="text-muted-foreground hover:text-destructive transition-colors">
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 </div>
))}
 {documents.length === 0 && (
 <div className="col-span-full py-6 text-center text-muted-foreground text-sm">
 Δεν υπάρχουν έγγραφα στην αρχειοθήκη.
 </div>
)}
 </div>

 </CardContent>
 </Card>
);
}

