const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const glob = require('glob');

const patterns = [
  'app/**/*.js',
  'app/**/*.jsx',
  'app/**/*.ts',
  'app/**/*.tsx',
  'components/**/*.js',
  'components/**/*.jsx',
  'components/**/*.ts',
  'components/**/*.tsx',
];

const files = patterns.flatMap((p) => glob.sync(p, { cwd: root }));

let found = [];

files.forEach((file) => {
  const abs = path.join(root, file);
  const content = fs.readFileSync(abs, 'utf8');
  if (/bg-gradient-to|from=\[|to=\[|from:#|to:#|bg-gradient|linear-gradient/.test(content)) {
    found.push(file);
  }
});

console.log(`Scanned ${files.length} files.`);
if (found.length === 0) {
  console.log('No inline gradients or old background patterns found — all good.');
  process.exit(0);
}

console.log('Files with inline gradients / hardcoded backgrounds:');
found.forEach((f) => console.log(' -', f));
console.log('\nPlease review the above files and replace with `bg-nirvaanaa-offwhite` where appropriate.');
process.exit(found.length > 0 ? 1 : 0);
