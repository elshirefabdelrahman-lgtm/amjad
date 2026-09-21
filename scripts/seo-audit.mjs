import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');
const output = process.argv.find(value => !value.startsWith('--') && value !== process.argv[0] && value !== process.argv[1]) || 'seo-audit-after.md';
const bannedFile = path.join(root, 'banned-sibling-phrases.txt');
const bannedPhrases = fs.readFileSync(bannedFile, 'utf8').split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
const violations = [];
const htmlFiles = fs.readdirSync(root, { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
  .filter(entry => !entry.parentPath.includes('node_modules') && !entry.parentPath.includes('.git'))
  .map(entry => path.join(entry.parentPath, entry.name))
  .sort((a, b) => a.localeCompare(b, 'ar'));

const text = (html, regex) => html.match(regex)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
const rows = htmlFiles.map(file => {
  const html = fs.readFileSync(file, 'utf8');
  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  for (const phrase of bannedPhrases) if (visible.includes(phrase)) violations.push(`${path.relative(root, file)}: ${phrase}`);
  const words = visible.replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return {
    page: path.relative(root, file).replaceAll('\\', '/'),
    title: text(html, /<title>([\s\S]*?)<\/title>/i),
    description: text(html, /<meta\s+name="description"\s+content="([^"]*)"/i),
    h1: text(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
    canonical: text(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i),
    words
  };
});

const esc = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const markdown = `# SEO audit\n\nGenerated: ${new Date().toISOString()}\n\n| Page | Title | Meta description | H1 | Words | Canonical |\n|---|---|---|---|---:|---|\n${rows.map(row => `| ${esc(row.page)} | ${esc(row.title)} | ${esc(row.description)} | ${esc(row.h1)} | ${row.words} | ${esc(row.canonical)} |`).join('\n')}\n`;
if (!checkOnly) {
  fs.writeFileSync(path.join(root, output), markdown);
  console.log(`Wrote ${output} for ${rows.length} HTML files.`);
}
if (violations.length) {
  console.error(`Sibling-template phrase check failed:\n- ${violations.join('\n- ')}`);
  process.exit(1);
}
console.log(`Sibling-template phrase check passed for ${rows.length} HTML files.`);
