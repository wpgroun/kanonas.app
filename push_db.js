const { execSync } = require('child_process');
try {
  console.log('Running db push...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('Running generate...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('All Done!');
} catch(e) {
  process.exit(1);
}
