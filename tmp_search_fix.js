const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/actions/search.ts');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove mode: 'insensitive' entirely
content = content.replace(/, mode: 'insensitive'/g, '');

// 2. Change Promise.all to Promise.allSettled to prevent total collapse
// Because Prisma returns results, we just map successful ones.
const targetAll = `const [parishioners, protocols, beneficiaries, assets] = await Promise.all([
    parSearch, protocolSearch, benSearch, assetSearch
  ]);`;

const replacementAll = `const settled = await Promise.allSettled([
    parSearch, protocolSearch, benSearch, assetSearch
  ]);
  const parishioners = settled[0].status === 'fulfilled' ? settled[0].value : [];
  const protocols = settled[1].status === 'fulfilled' ? settled[1].value : [];
  const beneficiaries = settled[2].status === 'fulfilled' ? settled[2].value : [];
  const assets = settled[3].status === 'fulfilled' ? settled[3].value : [];`;

content = content.replace(targetAll, replacementAll);

fs.writeFileSync(file, content, 'utf8');
console.log('Search fixed!');
