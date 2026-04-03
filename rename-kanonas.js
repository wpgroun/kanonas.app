const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceInFile(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.json') || filePath.endsWith('.md')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Emails and Domains
    content = content.replace(/deltos\.gr/gi, 'kanonas.gr');
    content = content.replace(/admin@Deltos\.gr/gi, 'admin@kanonas.gr');
    content = content.replace(/contact@deltos\.gr/gi, 'contact@kanonas.gr');
    content = content.replace(/noreply@Deltos\.gr/gi, 'noreply@kanonas.gr');
    
    // Config / Variables
    content = content.replace(/Deltos_auth/g, 'Kanonas_auth');
    
    // Main Texts
    content = content.replace(/Deltos/g, 'Κανόνας');
    content = content.replace(/deltos/g, 'kanonas'); // For general lowercase references

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
}

walkDir(path.join(__dirname, 'src'), replaceInFile);
walkDir(path.join(__dirname, 'components'), replaceInFile);
