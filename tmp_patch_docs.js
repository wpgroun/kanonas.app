const fs = require('fs');

let content = fs.readFileSync('src/actions/documents.ts', 'utf8');

content = content.replace(
  /await prisma\.docTemplate\.update\(\{ where: \{ id \}, data: \{ docType, nameEl, htmlContent \} \}\)/g,
  'await prisma.docTemplate.update({ where: { id }, data: { docType, nameEl, htmlContent, conditionRules } })'
);

content = content.replace(
  /data: \{ templeId, docType, nameEl, htmlContent \}/g,
  'data: { templeId, docType, nameEl, htmlContent, conditionRules }'
);

fs.writeFileSync('src/actions/documents.ts', content, 'utf8');
console.log('Action Updated successfully.');
