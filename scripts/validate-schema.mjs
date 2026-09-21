import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = fs.readdirSync(root, { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
  .filter(entry => !entry.parentPath.includes('node_modules') && !entry.parentPath.includes('.git'))
  .map(entry => path.join(entry.parentPath, entry.name));

const errors = [];
let blocks = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    blocks += 1;
    try {
      const data = JSON.parse(match[1]);
      const walk = node => {
        if (!node || typeof node !== 'object') return;
        const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
        if (types.includes('FAQPage')) {
          for (const item of node.mainEntity ?? []) {
            if (!visible.includes(item.name ?? '')) errors.push(`${path.relative(root, file)}: FAQ question is not visible`);
            if (!visible.includes(item.acceptedAnswer?.text ?? '')) errors.push(`${path.relative(root, file)}: FAQ answer is not visible`);
          }
        }
        if (types.includes('Service') && !node.areaServed) errors.push(`${path.relative(root, file)}: Service schema missing areaServed`);
        if (types.some(type => ['LocalBusiness', 'HomeAndConstructionBusiness'].includes(type))) {
          if (node.telephone !== '+966538341379') errors.push(`${path.relative(root, file)}: incorrect business telephone`);
          for (const forbidden of ['aggregateRating', 'review', 'reviewCount', 'openingHours', 'address']) {
            if (forbidden in node) errors.push(`${path.relative(root, file)}: unconfirmed ${forbidden}`);
          }
        }
        for (const value of Object.values(node)) if (value && typeof value === 'object') walk(value);
      };
      walk(data);
    } catch (error) {
      errors.push(`${path.relative(root, file)}: ${error.message}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Schema validation passed: ${blocks} JSON-LD blocks across ${files.length} HTML files.`);
