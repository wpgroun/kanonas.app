const fs = require('fs');
const path = require('path');

function replaceRecursively(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      replaceRecursively(filePath);
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.json')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('churchos')) {
          content = content.replace(/churchos/g, 'deltos');
          fs.writeFileSync(filePath, content, 'utf8');
        }
      }
    }
  }
}

replaceRecursively(path.join(__dirname, 'src'));
