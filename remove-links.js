const fs = require('fs');
const path = require('path');

const menuDir = path.join(__dirname, 'src', 'components', 'Header', 'Menu');
const files = fs.readdirSync(menuDir).filter(f => f.endsWith('.tsx'));

const desktopNavItems = ['Demo', 'Features', 'Product'];

let totalDesktop = 0;
let totalMobile = 0;

for (const file of files) {
    const filePath = path.join(menuDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const ranges = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // ---- Desktop nav: standalone text line ----
        for (const item of desktopNavItems) {
            const re = new RegExp('^\\s*' + item + '\\s*$');
            if (re.test(line)) {
                let liStart = -1, liIndent = '';
                for (let k = i - 1; k >= 0; k--) {
                    const m = lines[k].match(/^(\s*)<li\s/);
                    if (m) { liStart = k; liIndent = m[1]; break; }
                }
                let liEnd = -1;
                for (let k = i + 1; k < lines.length; k++) {
                    const cm = lines[k].match(/^(\s*)<\/li>/);
                    if (cm && cm[1].length === liIndent.length) { liEnd = k; break; }
                }
                if (liStart !== -1 && liEnd !== -1) {
                    const block = lines.slice(liStart, liEnd + 1).join('\n');
                    if (block.includes('<Link') && (block.includes('mega-menu') || block.includes('sub-menu'))) {
                        console.log(file + ': Desktop "' + item + '" nav lines ' + (liStart+1) + '-' + (liEnd+1));
                        ranges.push({ start: liStart, end: liEnd });
                        totalDesktop++;
                    }
                }
            }
        }
        
        // ---- Mobile nav: <a ...>text ----
        const mobileRe = /^\s*<(a|Link)\s+href=\{'#!'\}[^>]*>(Demo|Features|Product)\s*$/;
        const mm = line.match(mobileRe);
        if (mm) {
            const item = mm[3];
            let liStart = -1, liIndent = '';
            for (let k = i - 1; k >= 0; k--) {
                const m = lines[k].match(/^(\s*)<li\s/);
                if (m) { liStart = k; liIndent = m[1]; break; }
            }
            let liEnd = -1;
            for (let k = i + 1; k < lines.length; k++) {
                const cm = lines[k].match(/^(\s*)<\/li>/);
                if (cm && cm[1].length === liIndent.length) { liEnd = k; break; }
            }
            if (liStart !== -1 && liEnd !== -1) {
                const block = lines.slice(liStart, liEnd + 1).join('\n');
                if (block.includes('sub-nav-mobile')) {
                    console.log(file + ': Mobile "' + item + '" nav lines ' + (liStart+1) + '-' + (liEnd+1));
                    ranges.push({ start: liStart, end: liEnd });
                    totalMobile++;
                }
            }
        }
    }
    
    if (ranges.length > 0) {
        ranges.sort(function(a, b) { return b.start - a.start; });
        for (let r = 0; r < ranges.length; r++) {
            lines.splice(ranges[r].start, ranges[r].end - ranges[r].start + 1);
        }
        fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
        console.log('  -> ' + file + ': Removed ' + ranges.length + ' nav section(s)');
    }
}

console.log('\nDone. Total: ' + totalDesktop + ' desktop + ' + totalMobile + ' mobile = ' + (totalDesktop + totalMobile) + ' nav items removed.');
