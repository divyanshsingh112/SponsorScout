const fs = require('fs');

const logPath = 'C:\\Users\\sdivy\\.gemini\\antigravity-ide\\brain\\ac382c9a-4ce1-42d9-a610-1dddd7a3558f\\.system_generated\\logs\\transcript.jsonl';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const parsed = JSON.parse(lines[i]);
    const text = JSON.stringify(parsed).toLowerCase();
    if (text.includes('base') || text.includes('midpoint') || text.includes('tier')) {
      console.log(`Line ${i} - Step ${parsed.step_index} - Type: ${parsed.type} - Source: ${parsed.source}`);
      // Find occurrences of "base" and print 500 chars around it
      let idx = text.indexOf('base');
      if (idx === -1) idx = text.indexOf('tier');
      console.log('Snippet:', text.substring(Math.max(0, idx - 100), Math.min(text.length, idx + 800)));
      console.log('============================');
    }
  }
} catch (err) {
  console.error(err);
}
