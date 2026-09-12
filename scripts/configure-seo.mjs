import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const origin=JSON.parse(fs.readFileSync('site-config.json','utf8')).origin?.replace(/\/$/,'');
const pages=fs.readdirSync(root,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()&&e.name.endsWith('.html')&&!e.parentPath.includes('node_modules')&&!e.parentPath.includes('.git')).map(e=>path.join(e.parentPath,e.name));
if(origin && (!/^https:\/\/[a-z0-9.-]+$/i.test(origin)||origin.includes('example')))throw Error('Set the confirmed HTTPS domain only.');
const urls=[];
for(const file of pages){let h=fs.readFileSync(file,'utf8');const rel=path.relative(root,file).replaceAll('\\','/');const route=rel==='index.html'?'':path.dirname(rel)+'/';const prefix=rel.includes('/')?'../':'./';const image=rel==='index.html'?'hero-حداد-مكة-أمجد.webp':h.match(/<img[^>]*src="[^" ]*images\/([^" ]+\.webp)"/)?.[1]||'حداد-مكة-أمجد-أبواب-حديد-01.webp';
h=h.replace(/<meta property="og:(?:image|url)"[^>]*>/g,'').replace(/<meta name="twitter:image"[^>]*>/g,'').replace(/<link rel="canonical"[^>]*>/g,'').replace(/<link rel="apple-touch-icon"[^>]*>/g,'').replace(/<link rel="icon"[^>]*type="image\/png"[^>]*>/g,'');
const url=origin?origin+'/'+route:null;
if(rel!=='404.html'&&origin){h=h.replace('noindex, follow, max-image-preview:large','index, follow, max-image-preview:large');urls.push(url);h=h.replace('</head>',`<link rel="canonical" href="${url}"><meta property="og:url" content="${url}"></head>`);}
h=h.replace('</head>',`<meta property="og:image" content="${origin?origin+'/':prefix}images/${image}"><meta name="twitter:image" content="${origin?origin+'/':prefix}images/${image}"><link rel="icon" href="${prefix}images/favicon-48.png" type="image/png" sizes="48x48"><link rel="apple-touch-icon" href="${prefix}images/apple-touch-icon.png" sizes="180x180"></head>`);
if(origin)h=h.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,json)=>{const data=JSON.parse(json);function walk(o){if(!o||typeof o!=='object')return;for(const [key,v]of Object.entries(o)){if(typeof v==='string'&&key==='item'&&v.startsWith('.')){const target=path.relative(root,path.resolve(path.dirname(file),v)).replaceAll('\\','/');o[key]=origin+'/'+(target==='index.html'?'':target.replace(/index.html$/,''));}else if(key==='@id'&&typeof v==='string'&&v.startsWith('#'))o[key]=origin+'/'+v;else walk(v);}if(o['@type']==='WebSite'||(Array.isArray(o['@type'])&&o['@type'].includes('Organization')))o.url=origin+'/';if(o['@type']==='Service')o.url=url;}walk(data);return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;});
fs.writeFileSync(file,h);}
fs.writeFileSync('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
if(origin)fs.writeFileSync('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
console.log(origin?`Production SEO configured: ${urls.length} URLs`:'Staging SEO: awaiting confirmed Amjad domain');
