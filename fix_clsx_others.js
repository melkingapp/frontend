const fs = require('fs');

function replaceClsxInFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf-8');
  if (!code.includes('import clsx')) return;

  code = code.replace(/import clsx from "clsx";\n?/, '');

  // A very naive replacement: find `className={clsx(` and replace with standard template literal.
  // Actually, wait, it's safer to provide a safe inline polyfill if there are many complex objects,
  // but let's check if they use objects first.
  fs.writeFileSync(filepath, code);
}

// First, check for objects in clsx calls.
