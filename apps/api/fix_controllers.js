const fs = require('fs');
const path = require('path');
const dir = 'src/controllers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('NextFunction')) {
    content = "import { NextFunction } from 'express';\n" + content;
  }
  content = content.replace(/res: Response\): Promise<void> => {/g, 'res: Response, next: NextFunction): Promise<void> => {');
  content = content.replace(/res\.status\(500\)\.json\(\{ success: false, error: \{ message: 'Server error' \} \}\);/g, 'next(error);');

  fs.writeFileSync(filePath, content);
});
console.log('Fixed controllers');
