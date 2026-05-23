const fs = require('fs');
const path = require('path');
const os = require('os');

const tempDir = os.tmpdir();
console.log('Searching temp directory:', tempDir);

function walkDir(dir, callback) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(filePath);
      } catch (e) {
        continue;
      }
      if (stat.isDirectory()) {
        // limit recursion depth for safety
        if (filePath.split(path.sep).length - tempDir.split(path.sep).length < 3) {
          walkDir(filePath, callback);
        }
      } else {
        callback(filePath);
      }
    }
  } catch (e) {
    // Ignore error
  }
}

let foundCount = 0;
walkDir(tempDir, (filePath) => {
  if (filePath.toLowerCase().includes('instruction') || filePath.toLowerCase().includes('sponsorscout')) {
    console.log('Found file matching name:', filePath);
    try {
      const stat = fs.statSync(filePath);
      if (stat.size < 100000) { // < 100KB
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('v4.0') && content.includes('PRICING ENGINE')) {
          console.log(`>>> FOUND IT IN TEMP FILE: ${filePath}`);
          foundCount++;
          fs.writeFileSync('found_instructions_temp.txt', content, 'utf8');
        }
      }
    } catch (e) {}
  }
});

console.log(`Done! Found ${foundCount} temp files.`);
