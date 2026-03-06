import fs from 'fs';
const path = 'dist/dev/mp-weixin/app.wxss';

try {
    const content = fs.readFileSync(path, 'utf8');
    const pos = 2883;
    const start = Math.max(0, pos - 50);
    const end = Math.min(content.length, pos + 50);

    if (pos >= content.length) {
        console.log(`Position ${pos} is out of bounds (file length: ${content.length})`);
    } else {
        console.log(`Character at ${pos}: '${content[pos]}'`);
        console.log('Context:');
        console.log(content.slice(start, end));
        console.log('---');

        // Also print line 119
        const lines = content.split('\n');
        console.log(`Line 119: ${lines[118]}`); // 0-indexed
    }
} catch (e) {
    console.error(e);
}
