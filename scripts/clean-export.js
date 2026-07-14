const fs = require('fs');
const path = require('path');

for (const folder of ['out', '.next']) {
  const target = path.join(process.cwd(), folder);

  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`Removed ${folder}`);
  }
}
