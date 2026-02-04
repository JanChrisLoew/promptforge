import fs from 'fs';
import path from 'path';

const MAX_LINES = 350;
const EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDE = ['node_modules', 'dist', '.git'];

function checkFiles(dir) {
    const files = fs.readdirSync(dir);
    let hasError = false;

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            if (!EXCLUDE.includes(file)) {
                if (checkFiles(fullPath)) hasError = true;
            }
        } else if (EXTENSIONS.includes(path.extname(file))) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n').length;

            if (lines > MAX_LINES) {
                console.error(`\x1b[31m[FAIL]\x1b[0m ${fullPath}: ${lines} lines (Max: ${MAX_LINES})`);
                hasError = true;
            } else {
                console.log(`\x1b[32m[PASS]\x1b[0m ${fullPath}: ${lines} lines`);
            }
        }
    });

    return hasError;
}

console.log(`Checking file lengths (Max: ${MAX_LINES} lines)...`);
const error = checkFiles('./');

if (error) {
    console.error('\n\x1b[31mError:\x1b[0m Some files exceed the maximum line limit. Please modularize them.');
    process.exit(1);
} else {
    console.log('\n\x1b[32mSuccess:\x1b[0m All files are within the allowed limit.');
}
