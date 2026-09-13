import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const root = process.cwd();
const required = ['index.html', '404.html', 'css/style.css', 'js/main.js', 'images/favicon.svg', 'images/apple-touch-icon.png', 'site-config.json', 'robots.txt', 'sitemap.xml'];
const missingRequired = required.filter(file => !existsSync(join(root, file)));
if (missingRequired.length) throw new Error(`Missing required files: ${missingRequired.join(', ')}`);

const htmlFiles = readdirSync(root, { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
  .filter(entry => !entry.parentPath.includes('node_modules') && !entry.parentPath.includes('.git'))
  .map(entry => join(entry.parentPath, entry.name));
const issues = [];
const indexable = [];
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();
const expectedPhone = 'tel:+966538341379';
const expectedWhatsApp = 'https://wa.me/966538341379';
const expectedEmail = 'mailto:alahmramgad@gmail.com';
const officialOrigin = JSON.parse(readFileSync(join(root,'site-config.json'),'utf8')).origin;

const one = (html, pattern) => html.match(pattern)?.[1]?.trim() ?? '';
const remember = (map, value, file, label) => {
  if (!value) return;
  if (map.has(value)) issues.push(`Duplicate ${label}: "${value}" in ${relative(root, file)} and ${relative(root, map.get(value))}`);
  else map.set(value, file);
};

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const name = relative(root, file);
  const is404 = name === '404.html';
  if (!is404 && (!html.includes(expectedPhone) || !html.includes(expectedWhatsApp))) issues.push(`${name}: missing Amjad contact links`);
  const retiredBrand = ['abu', 'jassar'].join('');
  const retiredArabic = ['أبو', 'جسار'].join(' ');
  if (html.toLowerCase().replaceAll(' ', '').includes(retiredBrand) || html.includes(retiredArabic)) issues.push(`${name}: retired brand reference`);
  const title = one(html, /<title>([^<]+)<\/title>/i);
  const description = one(html, /<meta\s+name="description"\s+content="([^"]+)"/i);
  const robots = one(html, /<meta\s+name="robots"\s+content="([^"]+)"/i);
  const canonical = one(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const visibleHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  if (!is404 && officialOrigin && !robots.startsWith('index')) issues.push(`${name}: content page must be indexable`);
  if (!is404 && (html.match(/<link\s+rel="canonical"/gi) ?? []).length !== 1) issues.push(`${name}: expected one canonical`);
  const h1Count = (html.match(/<h1(?:\s|>)/gi) ?? []).length;

  if (!/<html\s+lang="ar"\s+dir="rtl">/i.test(html)) issues.push(`${name}: missing lang="ar" or dir="rtl"`);
  if (!title) issues.push(`${name}: missing title`);
  if (!description) issues.push(`${name}: missing meta description`);
  if (h1Count !== 1) issues.push(`${name}: expected exactly one H1, found ${h1Count}`);
  if (!robots) issues.push(`${name}: missing robots meta`);
  remember(titles, title, file, 'title');
  remember(descriptions, description, file, 'meta description');

  if (/(?:href|src)="\/(?!\/)/.test(html)) issues.push(`${name}: root-relative local path fails under file://`);
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:)/.test(value)) continue;
    const target = resolve(dirname(file), decodeURIComponent(value.split('?')[0]));
    if (!existsSync(target)) issues.push(`${name}: missing local target ${value}`);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt="[^"]*"/i.test(match[0])) issues.push(`${name}: image missing alt`);
    if (!/width="\d+"/i.test(match[0]) || !/height="\d+"/i.test(match[0])) issues.push(`${name}: image dimensions missing`);
  }
  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    if (!/rel="[^"]*noopener[^"]*"/i.test(match[0]) || !/rel="[^"]*noreferrer[^"]*"/i.test(match[0])) {
      issues.push(`${name}: target="_blank" link missing noopener noreferrer`);
    }
  }
  for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1]);
      const nodes = data['@graph'] ?? [data];
      const checkSchema = node => {
        if (!node || typeof node !== 'object') return;
        if (node.telephone && node.telephone !== '+966538341379') issues.push(`${name}: incorrect schema phone`);
        if (node.email && node.email !== 'alahmramgad@gmail.com') issues.push(`${name}: incorrect schema email`);
        for (const key of ['aggregateRating','review','ratingValue','reviewCount','openingHours','address']) if (key in node) issues.push(`${name}: unconfirmed business schema field ${key}`);
        if (node['@type'] === 'BreadcrumbList') for (const item of node.itemListElement ?? []) {
          if (!item.item?.startsWith(`${officialOrigin}/`)) issues.push(`${name}: breadcrumb URL must use official HTTPS origin`);
          else { const url = new URL(item.item); const route = decodeURIComponent(url.pathname); if (!existsSync(join(root, route, 'index.html'))) issues.push(`${name}: breadcrumb URL has no page`); }
        }
        for (const value of Object.values(node)) if (value && typeof value === 'object') checkSchema(value);
      };
      checkSchema(data);
      for (const node of nodes) {
    if (node['@type'] !== 'FAQPage') continue;
        for (const item of node.mainEntity ?? []) {
          const question = item.name ?? '';
          const answer = item.acceptedAnswer?.text ?? '';
          if (!question || !visibleHtml.includes(question)) issues.push(`${name}: FAQ schema question is not visible`);
          if (!answer || !visibleHtml.includes(answer)) issues.push(`${name}: FAQ schema answer is not visible`);
        }
      }
    } catch (error) { issues.push(`${name}: invalid JSON-LD (${error.message})`); }
  }

  if (!is404 && robots.startsWith('index')) {
    indexable.push({ file, name, html, canonical });
    if (!canonical) issues.push(`${name}: indexable page missing canonical`);
    const route = name === 'index.html' ? '' : `${dirname(name).split(sep).join('/')}/`;
    const expectedCanonical = `${officialOrigin}/${route}`;
    if (canonical !== expectedCanonical) issues.push(`${name}: canonical must match its route (${expectedCanonical})`);
    remember(canonicals, canonical, file, 'canonical');
    for (const property of ['og:type', 'og:locale', 'og:title', 'og:description', 'og:url', 'og:image']) {
      if (!html.includes(`property="${property}"`)) issues.push(`${name}: missing ${property}`);
    }
    const ogUrl = one(html, /property="og:url"\s+content="([^"]+)"/);
    if (ogUrl !== canonical) issues.push(`${name}: og:url differs from canonical`);
    const ogImage = one(html, /property="og:image"\s+content="([^"]+)"/);
    if (!ogImage.startsWith(`${officialOrigin}/images/`) || !existsSync(join(root,decodeURIComponent(new URL(ogImage).pathname)))) issues.push(`${name}: incorrect or missing social image`);
    if (!html.includes('name="twitter:card"')) issues.push(`${name}: missing twitter:card`);
    if (!html.includes(expectedPhone)) issues.push(`${name}: missing canonical phone link`);
    if (!html.includes(expectedWhatsApp)) issues.push(`${name}: missing canonical WhatsApp link`);
  }
  if (is404 && !robots.includes('noindex')) issues.push('404.html must be noindex');
}

const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].trim());
if (new Set(sitemapUrls).size !== sitemapUrls.length) issues.push('sitemap.xml contains duplicate URLs');
for (const page of indexable) {
  if (!sitemapUrls.includes(page.canonical)) issues.push(`${page.name}: canonical missing from sitemap.xml`);
}
for (const url of sitemapUrls) {
  if (!indexable.some(page => page.canonical === url)) issues.push(`sitemap.xml contains non-indexable or unknown URL: ${url}`);
}
if (sitemap.includes('404')) issues.push('sitemap.xml must not include the 404 page');

const robotsText = readFileSync(join(root, 'robots.txt'), 'utf8');
if (!/^User-agent:\s*\*/mi.test(robotsText) || !/^Allow:\s*\/$/mi.test(robotsText)) issues.push('robots.txt must allow crawling');
if (officialOrigin && !robotsText.includes(`Sitemap: ${officialOrigin}/sitemap.xml`)) issues.push('robots.txt has an incorrect sitemap reference');

const homepage = readFileSync(join(root, 'index.html'), 'utf8');
if (!officialOrigin && indexable.length) issues.push('Unconfirmed domain: staging pages must stay noindex');
if (homepage.includes('google-site-verification') && /content="(?:placeholder|insert[^" ]*)"/i.test(homepage)) issues.push('Homepage contains an invented verification token');
if (!homepage.includes(expectedEmail)) issues.push('Homepage is missing the canonical email link');
if (!homepage.includes('./images/favicon.svg') || !homepage.includes('./images/apple-touch-icon.png')) issues.push('Homepage is missing Amjad icon declarations');
if (homepage.includes('aggregateRating') || homepage.includes('ratingValue') || homepage.includes('reviewCount')) issues.push('Homepage contains unsupported rating schema');
if (!homepage.includes('./css/style.css') || !homepage.includes('./js/main.js')) issues.push('Homepage static asset references are incomplete');
if (!readFileSync(join(root, 'css/style.css'), 'utf8').includes('prefers-reduced-motion')) issues.push('CSS is missing prefers-reduced-motion support');

if (issues.length) {
  console.error(`Production QA failed with ${issues.length} issue(s):\n- ${issues.join('\n- ')}`);
  process.exit(1);
}
console.log(`${officialOrigin ? 'Production' : 'Staging'} QA passed: ${indexable.length} indexable pages, ${sitemapUrls.length} sitemap URLs, ${htmlFiles.length} HTML files, valid metadata/JSON-LD, safe external links, and file:// compatible local paths.${officialOrigin ? '' : ' Confirm the domain to activate indexing for the 18 content pages.'}`);
