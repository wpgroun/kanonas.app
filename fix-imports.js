const fs = require('fs');
const path = require('path');

// 1. Create constants.ts
const constantsPath = path.join('src', 'lib', 'constants.ts');
fs.writeFileSync(constantsPath, 'export const TEMP_TEMPLE_ID = "cm0testtempleid0000000001";\n');

// 2. Restore use server and remove TEMP_TEMPLE_ID from core.ts
const corePath = path.join('src', 'actions', 'core.ts');
let coreContent = fs.readFileSync(corePath, 'utf8');
if (!coreContent.includes("'use server'")) {
    coreContent = "'use server'\n" + coreContent;
}
coreContent = coreContent.replace(/export const TEMP_TEMPLE_ID = .*\n/g, '');
fs.writeFileSync(corePath, coreContent);

// 3. Fix app/actions.ts barrel file
const actionsBarrelPath = path.join('src', 'app', 'actions.ts');
let barrelContent = fs.readFileSync(actionsBarrelPath, 'utf8');
barrelContent = barrelContent.replace(/export\s*\{\s*TEMP_TEMPLE_ID,\s*getCurrentTempleId,\s*seedDummyTemple\s*\}\s*from\s*'@\/actions\/core'/, "export { TEMP_TEMPLE_ID } from '@/lib/constants'\nexport { getCurrentTempleId, seedDummyTemple } from '@/actions/core'");
fs.writeFileSync(actionsBarrelPath, barrelContent);

// 4. Update all files in src/actions to import from @/lib/constants instead of ./core
const actionsDir = path.join('src', 'actions');
const files = fs.readdirSync(actionsDir);
for (const file of files) {
  if (file === 'core.ts' || !file.endsWith('.ts')) continue;
  const filePath = path.join(actionsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  if (content.includes('TEMP_TEMPLE_ID')) {
    // If it imports both seedDummyTemple and TEMP_TEMPLE_ID
    if (content.match(/import\s*\{\s*seedDummyTemple,\s*TEMP_TEMPLE_ID\s*\}\s*from\s*'\.\/core'/)) {
        content = content.replace(/import\s*\{\s*seedDummyTemple,\s*TEMP_TEMPLE_ID\s*\}\s*from\s*'\.\/core'/, "import { TEMP_TEMPLE_ID } from '@/lib/constants'\nimport { seedDummyTemple } from './core'");
        changed = true;
    }
    // If it only imports TEMP_TEMPLE_ID
    else if (content.match(/import\s*\{\s*TEMP_TEMPLE_ID\s*\}\s*from\s*'\.\/core'/)) {
        content = content.replace(/import\s*\{\s*TEMP_TEMPLE_ID\s*\}\s*from\s*'\.\/core'/, "import { TEMP_TEMPLE_ID } from '@/lib/constants'");
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content);
    }
  }
}
console.log('Fixed imports!');
