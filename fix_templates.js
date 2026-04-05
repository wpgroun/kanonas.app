const fs = require('fs');
let content = fs.readFileSync('src/app/admin/settings/templates/TemplateClient.tsx', 'utf8');

// Find and replace the MNHMOSYNO line to add more categories before it
const oldLine = '<SelectItem value="MNHMOSYNO">';
const newLines = `<SelectItem value="AGAMIA">Πιστοπ. Αγαμίας</SelectItem>
  <SelectItem value="PARAXORISI">Παραχώρηση Αδείας</SelectItem>
  <SelectItem value="ETERODOXOS">Ετερόδοξοι</SelectItem>
  <SelectItem value="MNHMOSYNO">`;

content = content.replace(oldLine, newLines);

// Also add VEVEOSI before ALLO
const oldAllo = '<SelectItem value="ALLO">';
const newAllo = `<SelectItem value="VEVEOSI">Βεβαίωση</SelectItem>
  <SelectItem value="ALLO">`;
content = content.replace(oldAllo, newAllo);

fs.writeFileSync('src/app/admin/settings/templates/TemplateClient.tsx', content);
console.log('Template categories updated!');
