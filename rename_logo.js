const fs = require('fs');

const files = [
  'src/app/forgot-password/page.tsx',
  'src/app/terms/page.tsx',
  'src/app/reset-password/page.tsx',
  'src/app/register/page.tsx',
  'src/app/privacy/page.tsx',
  'src/app/page.tsx',
  'src/app/onboarding/page.tsx',
  'src/app/myaccount/page.tsx',
  'src/app/login/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/admin/layout.tsx',
  'src/app/admin/onboarding/OnboardingWizard.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/<span className="([^"]*)">Κ<\/span>/g, '<span className="$1" style={{fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.3em", paddingRight: "2px"}}>κ</span>');
    fs.writeFileSync(f, content);
    console.log('Updated logo on ' + f);
  }
});
