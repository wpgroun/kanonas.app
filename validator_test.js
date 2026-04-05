const { execSync } = require('child_process');
try {
  execSync('npx prisma validate', { encoding: 'utf-8' });
  console.log('Valid');
} catch (e) {
  console.error(e.stdout || e.message);
}
