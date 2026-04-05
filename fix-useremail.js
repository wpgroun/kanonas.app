const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'actions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

let totalReplaced = 0;
for (const file of files) {
  const fullPath = path.join(dir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  const updated = content.replaceAll('userEmail: session.userId', 'userEmail: session.userEmail');
  if (updated !== content) {
    fs.writeFileSync(fullPath, updated, 'utf8');
    const count = (content.match(/userEmail: session\.userId/g) || []).length;
    totalReplaced += count;
    console.log(`Fixed ${count} occurrence(s) in ${file}`);
  }
}
console.log(`\nTotal: ${totalReplaced} occurrences fixed.`);
