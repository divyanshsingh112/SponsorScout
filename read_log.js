const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\sdivy\\.gemini\\antigravity-ide\\brain\\ac382c9a-4ce1-42d9-a610-1dddd7a3558f\\.system_generated\\logs\\transcript.jsonl';

try {
  const fileContent = fs.readFileSync(logPath, 'utf8');
  const lines = fileContent.split('\n');
  if (lines.length > 0) {
    const firstLineObj = JSON.parse(lines[0]);
    const requestText = firstLineObj.content;
    fs.writeFileSync('original_request.txt', requestText, 'utf8');
    console.log('Successfully saved original request to original_request.txt! Total length:', requestText.length);
  } else {
    console.log('No lines in transcript.jsonl');
  }
} catch (err) {
  console.error('Error:', err);
}
