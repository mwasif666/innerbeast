const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'out');
const indexFile = path.join(outDir, 'index.html');
const nextStaticDir = path.join(outDir, '_next', 'static');

const fail = (message) => {
  console.error(`\nStatic export failed: ${message}`);
  console.error('Run npm run build again and share the full terminal error if this repeats.');
  process.exit(1);
};

if (!fs.existsSync(outDir)) {
  fail('out folder was not created.');
}

if (!fs.existsSync(indexFile)) {
  fail('out/index.html is missing.');
}

if (!fs.existsSync(nextStaticDir)) {
  fail('out/_next/static folder is missing.');
}

console.log('\nStatic export ready: upload the CONTENTS of the out folder to Hostinger public_html.');
