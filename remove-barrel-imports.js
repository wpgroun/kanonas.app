const fs = require('fs');
const path = require('path');

const barrelPath = path.join('src', 'app', 'actions.ts');
const barrelContent = fs.readFileSync(barrelPath, 'utf8');

// Build mapping
const mapping = {}; // { 'loginAction': '@/actions/auth' }
const exportRegex = /export\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;
let match;
while ((match = exportRegex.exec(barrelContent)) !== null) {
  const exports = match[1].split(',').map(s => s.trim()).filter(s => s);
  const source = match[2];
  exports.forEach(exp => {
    mapping[exp] = source;
  });
}

// Function to process a file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Regex to find imports from the barrel file. 
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"](\.\.\/\.\.\/actions|\.\.\/actions|@\/app\/actions|@\/actions|\.\.\/\.\.\/\.\.\/actions)['"]/g;
  
  let newContent = content.replace(importRegex, (match, importsStr, source) => {
     const imports = importsStr.split(',').map(s => s.trim()).filter(s => s);
     
     // Group by new source
     const grouped = {};
     let hasUnmapped = false;
     imports.forEach(imp => {
        const trueSource = mapping[imp];
        if (!trueSource) {
           console.warn('NOT MAPPED: ' + imp + ' in ' + filePath);
           hasUnmapped = true;
           grouped['@/app/actions'] = grouped['@/app/actions'] || [];
           grouped['@/app/actions'].push(imp);
        } else {
           grouped[trueSource] = grouped[trueSource] || [];
           grouped[trueSource].push(imp);
        }
     });

     let replacement = Object.entries(grouped).map(([src, imps]) => {
        return `import { ${imps.join(', ')} } from '${src}'`;
     }).join('\n');
     
     changed = true;
     return replacement;
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated', filePath);
  }
}

// Walk src/app recursively
function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      if (fullPath === path.join('src', 'app', 'actions.ts')) continue;
      processFile(fullPath);
    }
  }
}

walk(path.join('src', 'app'));
