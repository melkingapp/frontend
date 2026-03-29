const fs = require('fs');

function replacer(content) {
  return content.replace(/import clsx from ["']clsx["'];?\n/g, '')
                .replace(/className=\{clsx\(\s*([\s\S]*?)\s*\)\}/g, (match, p1) => {
                  const parts = p1.split(/,\s*/);
                  const strParts = [];
                  const exprParts = [];
                  for (let i = 0; i < parts.length; i++) {
                    const part = parts[i].trim();
                    if (!part) continue;
                    if (part.startsWith('"') && part.endsWith('"')) {
                        strParts.push(part.substring(1, part.length - 1));
                    } else if (part.startsWith('\'') && part.endsWith('\'')) {
                        strParts.push(part.substring(1, part.length - 1));
                    } else if (part.startsWith('`') && part.endsWith('`')) {
                        strParts.push(part.substring(1, part.length - 1));
                    } else {
                        exprParts.push(part);
                    }
                  }

                  let newClass = "";
                  if (strParts.length > 0) {
                      newClass += strParts.join(" ") + " ";
                  }

                  if (exprParts.length > 0) {
                      let exprStr = exprParts.map(e => `\${${e} || ""}`).join(" ");
                      return `className={\`${newClass.trim()} ${exprStr}\`.trim()}`;
                  } else {
                      return `className="${newClass.trim()}"`;
                  }
                });
}

const files = [
    'src/shared/components/headers/managerHeader/ManagerSidebar.jsx',
    'src/shared/components/headers/residentHeader/ResidentSidebar.jsx',
    'src/features/manager/notification/components/survey/SurveyItem.jsx'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = replacer(content);
    fs.writeFileSync(f, content);
});
