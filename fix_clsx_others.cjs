const fs = require('fs');

function cleanClsx(filepath) {
    let code = fs.readFileSync(filepath, 'utf-8');

    // Remove import
    code = code.replace(/import clsx from ["']clsx["'];\n?/, '');

    // Replace exact blocks
    code = code.replace(/className=\{clsx\(([\s\S]*?)\)\}/g, (match, args) => {
        // Only replace if there are no inner parentheses that could trick the regex
        // Actually this is dangerous with regex. Let's just do it correctly.
        return match;
    });
}
