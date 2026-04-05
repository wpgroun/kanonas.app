const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? 
            walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modified = 0;
walkDir(path.join(__dirname, 'src'), function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Regex to match "dark:" followed by Tailwind utility class name
        // e.g., dark:bg-slate-900, dark:hover:text-slate-200
        let newContent = content.replace(/\bdark:[a-zA-Z0-9\-/\\[\]]+\b/g, '');
        // Clean up multi spaces that might be left
        newContent = newContent.replace(/ +/g, ' ').replace(/ \)/g, ')').replace(/ "/g, '"').replace(/" /g, '"');
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            modified++;
            console.log('Cleaned:', filePath);
        }
    }
});
console.log(`Removed dark classes from ${modified} files.`);
