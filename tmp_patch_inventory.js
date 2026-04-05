const fs = require('fs');
let content = fs.readFileSync('src/actions/inventory.ts', 'utf8');

content = content.replace(
  /quantity: Number\(formData.quantity\) \|\| 0\s*\}/g,
  "quantity: Number(formData.quantity) || 0,\n        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null\n      }"
);

fs.writeFileSync('src/actions/inventory.ts', content, 'utf8');
console.log('Action Updated');
