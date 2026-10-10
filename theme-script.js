const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps', 'web', 'src');

const classMap = {
  // Backgrounds
  'bg-slate-950': 'bg-slate-50 dark:bg-slate-950',
  'bg-slate-900/50': 'bg-white/80 dark:bg-slate-900/50',
  'bg-slate-900/80': 'bg-white/90 dark:bg-slate-900/80',
  'bg-slate-900/40': 'bg-white/70 dark:bg-slate-900/40',
  'bg-slate-900': 'bg-white dark:bg-slate-900',
  'bg-slate-800': 'bg-slate-100 dark:bg-slate-800',
  'bg-slate-800/50': 'bg-slate-100/50 dark:bg-slate-800/50',
  'bg-slate-800/80': 'bg-slate-100/80 dark:bg-slate-800/80',
  'bg-slate-700': 'bg-slate-200 dark:bg-slate-700',
  
  // Login specifically uses these
  'bg-[#F4F7F9]': 'bg-[#F4F7F9] dark:bg-slate-950',
  'bg-white': 'bg-white dark:bg-slate-900', // Need to be careful with bg-white if it's not a card, but usually it is.

  // Borders
  'border-slate-800/50': 'border-slate-200 dark:border-slate-800/50',
  'border-slate-800': 'border-slate-200 dark:border-slate-800',
  'border-slate-700': 'border-slate-300 dark:border-slate-700',
  'border-slate-600': 'border-slate-300 dark:border-slate-600',
  
  // Text colors (except white which is tricky because of buttons)
  'text-slate-50': 'text-slate-900 dark:text-slate-50',
  'text-slate-300': 'text-slate-700 dark:text-slate-300',
  'text-slate-400': 'text-slate-600 dark:text-slate-400',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  
  // Specific overrides for primary colors which are lighter in dark mode, darker in light
  'text-primary-300': 'text-primary-700 dark:text-primary-300',
  'text-primary-400': 'text-primary-600 dark:text-primary-400',
  
  // Specific overrides for accent
  'text-accent-300': 'text-accent-700 dark:text-accent-300',
  'text-accent-400': 'text-accent-600 dark:text-accent-400',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We need to replace bg-white with bg-white dark:bg-slate-900 ONLY where it makes sense (e.g. Login container)
  // Let's do a more robust string replacement
  
  // First, we replace 'text-white' to 'text-slate-900 dark:text-white' ONLY if it's NOT inside a button or badge that needs white text.
  // Actually, we can just replace `text-white` but exclude if the line contains `bg-primary`, `bg-blue`, `bg-green`, `bg-red`, `bg-accent`.
  let lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Regular class replacements
    for (const [key, value] of Object.entries(classMap)) {
      // Use regex with word boundaries to avoid partial matches
      // but key can have '/', so we escape it
      const escapedKey = key.replace(/\//g, '\\/');
      // Match key if it's surrounded by quotes, spaces, or backticks
      const regex = new RegExp(`(?<=["'\\\`\\s])${escapedKey}(?=["'\\\`\\s])`, 'g');
      
      // Prevent double applying (e.g. if dark:bg-slate-950 is already there)
      if (!line.includes(`dark:${key}`)) {
        line = line.replace(regex, value);
      }
    }
    
    // text-white replacement
    if (line.includes('text-white') && 
        !line.includes('bg-primary') && 
        !line.includes('bg-blue') && 
        !line.includes('bg-green') && 
        !line.includes('bg-red') && 
        !line.includes('bg-purple') && 
        !line.includes('bg-accent') &&
        !line.includes('dark:text-white')) {
      line = line.replace(/(?<=["'\`\s])text-white(?=["'\`\s])/g, 'text-slate-900 dark:text-white');
    }
    
    lines[i] = line;
  }
  
  content = lines.join('\n');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walk(srcDir);
console.log('Done!');
