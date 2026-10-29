import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve, sep, dirname, basename } from 'node:path';
import { build } from 'vite';
import { redesign } from '../src/work-data.js';

const root = resolve(import.meta.dirname, '..');
const mimeTypes = { svg: 'image/svg+xml', woff2: 'font/woff2', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif' };

// Production remains a normal multi-page build. A separate single-entry build
// gives portable viewers one inline script per page, without shared JS imports.
async function standalone(entry, directory, deferredImages = null) {
  const dist = resolve(root, '.vite', directory);
  await build({ configFile: false, root, logLevel: 'warn', build: {
    outDir: dist, emptyOutDir: true,
    rollupOptions: { input: resolve(root, entry), output: { codeSplitting: false } },
  } });
  const readAsset = (path) => {
    const absolute = resolve(dist, path.replace(/^\/+/, ''));
    if (!absolute.startsWith(`${dist}${sep}`)) throw new Error(`Invalid build asset: ${path}`);
    return readFile(absolute);
  };
  async function embed(path) {
    const type = mimeTypes[path.split('.').pop()];
    if (!type) throw new Error(`Unsupported preview asset: ${path}`);
    return `data:${type};base64,${(await readAsset(path)).toString('base64')}`;
  }
  let html = await readFile(resolve(dist, entry), 'utf8');
  const scriptTag = html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
  const styleTag = html.match(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
  if (!scriptTag || !styleTag) throw new Error('Expected one portable script and stylesheet.');
  let js = (await readAsset(scriptTag[1])).toString('utf8');
  let css = (await readAsset(styleTag[1])).toString('utf8');
  const characters = [...new Set(js + css)].map((character) => character.codePointAt(0));
  css = css.replace(/@font-face\s*\{[^}]*\}/g, (face) => {
    const ranges = face.match(/unicode-range:([^;}]+)/)?.[1];
    if (!ranges) return face;
    const used = ranges.split(',').some((range) => {
      const [start, end = start] = range.trim().replace(/^U\+/i, '').split('-');
      const low = parseInt(start.replaceAll('?', '0'), 16), high = parseInt(end.replaceAll('?', 'F'), 16);
      return characters.some((code) => code >= low && code <= high);
    });
    return used ? face : '';
  });
  for (const [, path] of [...css.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)]) {
    if (!path.startsWith('data:')) css = css.replaceAll(path, await embed(path));
  }
  for (const path of new Set([...js.matchAll(/\/(?:images|assets)\/[\w.-]+\.(?:svg|png|jpe?g|webp|avif)/g)].map((match) => match[0]))) {
    const data = await embed(path);
    if (deferredImages && path.startsWith('/assets/')) deferredImages[path] = data;
    else js = js.replaceAll(path, data);
  }
  html = html.replace(scriptTag[0], '');
  // Callbacks preserve literal replacement tokens such as $& in compiled JS.
  html = html.replace(styleTag[0], () => `<style>${css}</style>`);
  const favicon = await embed('/favicon.svg');
  html = html.replace('href="/favicon.svg"', () => `href="${favicon}"`);
  return html.replace('</body>', () => `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>\n</body>`);
}

const home = await standalone('index.html', 'portable-home');
const detailImages = {};
const secondary = await standalone('redesign/index.html', 'portable-redesign', detailImages);

// A download alternative for viewers that cannot open a large inline HTML.
// Each small HTML contains its own JS/CSS/fonts. Original PNGs stay separate
// and byte-identical, so opening index.html needs no server or installation.
if (process.argv.includes('--download')) {
  const destination = resolve(root, '.vite/download-preview');
  await rm(destination, { recursive: true, force: true });
  await mkdir(resolve(destination, 'assets'), { recursive: true });
  for (const [source, data] of Object.entries(detailImages)) {
    await writeFile(resolve(destination, 'assets', basename(source)), Buffer.from(data.slice(data.indexOf(',') + 1), 'base64'));
  }
  const pages = [
    { path: '/', file: 'index.html', html: home },
    { path: '/redesign/', file: 'redesign/index.html', html: secondary },
    ...redesign.projects.map((project) => ({ path: project.link, file: `${project.link.split('/').filter(Boolean).join('/')}/index.html`, html: secondary })),
  ];
  const routes = {};
  for (const page of pages) {
    routes[page.path] = page.file;
    if (page.path !== '/') {
      routes[page.path.endsWith('/') ? page.path.slice(0, -1) : `${page.path}/`] = page.file;
    }
  }
  for (const page of pages) {
    const prefix = '../'.repeat(page.file.split('/').length - 1);
    let html = page.html;
    for (const source of Object.keys(detailImages)) html = html.replaceAll(source, `${prefix}assets/${basename(source)}`);
    const context = `<script>globalThis.__PORTFOLIO_PREVIEW_PATH__=${JSON.stringify(page.path)};</script>`;
    const links = `<script>(()=>{const routes=${JSON.stringify(routes)};const prefix=${JSON.stringify(prefix)};for(const link of document.querySelectorAll('a[href]')){const path=link.getAttribute('href');if(path.startsWith('/#'))link.setAttribute('href',prefix+'index.html'+path.slice(1));else if(routes[path])link.setAttribute('href',prefix+routes[path]);}})();</script>`;
    html = html.replace('<head>', () => `<head>${context}`).replace('</body>', () => `${links}</body>`);
    const file = resolve(destination, page.file);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);
  }
  await writeFile(resolve(destination, '먼저 읽어주세요.txt'), '압축을 모두 푼 뒤 index.html을 Chrome, Edge 또는 Safari로 여세요.\n설치나 개발 서버 없이 메인 → REDESIGN → 가족센터를 탐색할 수 있습니다.\nHTML 파일을 폴더에서 따로 옮기지 마세요. assets 폴더의 두 PNG는 업로드 원본 그대로입니다.\n');
  console.log(`Download preview: ${destination} (${pages.length} HTML pages, original artwork kept separate)`);
  process.exit(0);
}
// Keep real navigation in the deployed site. In a serverless/sandboxed viewer,
// secondary pages run in an isolated full-window frame with embedded assets.
// The home DOM remains intact so its approved interactions and scroll survive.
const navigation = `
(() => {
  const secondary = ${JSON.stringify(secondary).replace(/</g, '\\u003c')};
  const detailImages = ${JSON.stringify(detailImages)};
  let frame;
  let previousOverflow = '';
  const supported = new Set(${JSON.stringify(['/redesign/', ...redesign.projects.map((project) => project.link)])});
  function open(path) {
    if (!supported.has(path)) return;
    if (!frame) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.querySelector('#app').inert = true;
      frame = document.createElement('iframe');
      frame.name = 'portfolio-route';
      frame.title = 'REDESIGN 프로젝트';
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:1000;background:#f7f7f2;';
      document.body.append(frame);
    }
    const context = '<script>globalThis.__PORTFOLIO_PREVIEW_PATH__=' + JSON.stringify(path) + ';<\\/script>';
    const bridge = '<script>addEventListener("load",function(){scrollTo({top:0,behavior:"instant"});});document.addEventListener("click",function(event){const link=event.target.closest("a");const path=link&&link.getAttribute("href");if(path&&(path.startsWith("/redesign/")||path.startsWith("/#"))){event.preventDefault();parent.postMessage({type:"portfolio-route",path:path},"*");}});<\\/script>';
    // Preserve full-resolution originals once in the portable file, and only
    // copy their data into the family-center document. Other routes stay light.
    let page = secondary;
    if (path === '/redesign/family-center' || path === '/redesign/family-center/') {
      for (const [source, data] of Object.entries(detailImages)) page = page.replaceAll(source, data);
    }
    frame.srcdoc = page.replace('<head>', '<head>' + context).replace('</body>', () => bridge + '</body>');
    frame.focus();
  }
  document.addEventListener('click', (event) => {
    const path = event.target.closest('a')?.getAttribute('href');
    if (supported.has(path)) { event.preventDefault(); open(path); }
  });
  addEventListener('message', (event) => {
    if (!frame || event.source !== frame.contentWindow || event.data?.type !== 'portfolio-route') return;
    const path = event.data.path;
    if (supported.has(path)) { open(path); return; }
    if (!['/#top', '/#work', '/#about', '/#contact'].includes(path)) return;
    frame.remove(); frame = null;
    document.body.style.overflow = previousOverflow;
    document.querySelector('#app').inert = false;
    document.querySelector('[data-category-link="redesign"]').focus({ preventScroll: true });
    document.querySelector(path.slice(1))?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
})();`;
const html = home.replace('</body>', () => `<script>${navigation.replace(/<\/script/gi, '<\\/script')}</script>\n</body>`);
const destination = resolve(root, 'preview.html');
await writeFile(destination, html);
console.log(`Standalone preview: ${destination} (${Math.round(Buffer.byteLength(html) / 1024)} KiB, with REDESIGN routes)`);
