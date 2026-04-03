"use client";

import React, { useRef } from 'react';

type DocumentPreviewProps = {
  templateHtml: string;
  data: Record<string, string>;
  documentTitle: string;
};

export default function DocumentPreview({ templateHtml, data, documentTitle }: DocumentPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Αντικατάσταση μεταβλητών (π.χ. {{firstName}}) με τα πραγματικά δεδομένα!
  let compiledHtml = templateHtml;
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    compiledHtml = compiledHtml.replace(regex, data[key] || '');
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${documentTitle}</title>
            <style>
              body { 
                font-family: 'Times New Roman', serif; 
                padding: 50px; 
                line-height: 1.6; 
                font-size: 16px;
              }
              .doc-header { text-align: center; margin-bottom: 40px; }
              .doc-header h4 { margin: 5px 0; font-size: 18px; font-weight: normal; }
              .doc-title { font-size: 24px; font-weight: bold; margin-bottom: 30px; text-align: center; }
              .signature-block { margin-top: 80px; display: flex; justify-content: space-between; }
            </style>
          </head>
          <body>
            ${compiledHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      // Μικρή καθυστέρηση για να φορτώσουν τα fonts του browser
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeInUp 0.6s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Προεπισκόπηση Εγγράφου</h3>
        <button onClick={handlePrint} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🖨️</span> Εκτύπωση / Αποθήκευση σε PDF
        </button>
      </div>

      <div 
        ref={contentRef}
        style={{ 
          background: 'white', 
          color: 'black', 
          padding: '3rem', 
          minHeight: '297mm', // A4 Height approx
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          fontFamily: "'Times New Roman', serif"
        }}
        dangerouslySetInnerHTML={{ __html: compiledHtml }}
      />
    </div>
  );
}

