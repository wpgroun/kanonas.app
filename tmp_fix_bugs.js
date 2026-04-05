const fs = require('fs');

// 1. Fix ProtocolClient
try {
  let proto = fs.readFileSync('src/app/admin/protocol/ProtocolClient.tsx', 'utf8');
  proto = proto.replace(/router\.push\(\`\?\$?\{?params\.toString\(\)\}?\`\);/g, "router.push(`/admin/protocol?${params.toString()}`); router.refresh();");
  fs.writeFileSync('src/app/admin/protocol/ProtocolClient.tsx', proto, 'utf8');
  console.log('Fixed ProtocolClient');
} catch (e) { console.error(e); }

// 2. Fix OnboardingWizard
try {
  let obw = fs.readFileSync('src/app/admin/onboarding/OnboardingWizard.tsx', 'utf8');
  obw = obw.replace(/<datalist id="metro-list">[\s\S]*?<\/datalist>/m, `
    <select 
      className="input mt-2 border-slate-300" 
      onChange={(e) => {
         if(e.target.value) set('metropolisName', e.target.value);
      }}
    >
      <option value="">Επιλέξτε από διαθέσιμη λίστα (Προαιρετικό)...</option>
      <option value="Ιερά Αρχιεπισκοπή Αθηνών">Ιερά Αρχιεπισκοπή Αθηνών (Μητρόπολη Αθηνών)</option>
      {metropolises.map((m) => (
        <option key={m.id} value={m.name}>{m.name}</option>
      ))}
    </select>
  `);
  obw = obw.replace('list="metro-list"', '');
  fs.writeFileSync('src/app/admin/onboarding/OnboardingWizard.tsx', obw, 'utf8');
  console.log('Fixed OnboardingWizard');
} catch (e) { console.error(e); }

// 3. Fix AdminShell Navigation
try {
  let ash = fs.readFileSync('src/app/admin/AdminShell.tsx', 'utf8');
  ash = ash.replace(
    "{ href: '/admin/sacraments/divorces',",
    "{ href: '/admin/sacraments/baptisms', icon: FileText, label: 'Βιβλίο Βαπτίσεων', requiredPerm: null, moduleLabel: 'Βαπτίσεις & Μυστήρια' },\n              { href: '/admin/sacraments/marriages', icon: FileText, label: 'Βιβλίο Γάμων', requiredPerm: null, moduleLabel: 'Γάμοι & Μυστήρια' },\n              { href: '/admin/sacraments/divorces',"
  );
  fs.writeFileSync('src/app/admin/AdminShell.tsx', ash, 'utf8');
  console.log('Fixed AdminShell');
} catch (e) { console.error(e); }

// 4. Update task.md
try {
  let task = fs.readFileSync('c:/Users/user/.gemini/antigravity/brain/71396919-c702-44b0-a386-7ba4182f0bc6/task.md', 'utf8');
  task = task.replace('- `[ ]` 2. **AdminShell', '- `[x]` 2. **AdminShell');
  task = task.replace('- `[ ]` 4. **Onboarding', '- `[x]` 4. **Onboarding');
  task += '\n- `[x]` 5. **Protocol Tab**\n  - Render Protocol Page properly\n';
  fs.writeFileSync('c:/Users/user/.gemini/antigravity/brain/71396919-c702-44b0-a386-7ba4182f0bc6/task.md', task, 'utf8');
} catch (e) {}
