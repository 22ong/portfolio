import { readFile, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { build } from 'vite';
import { redesign } from '../src/work-data.js';

const root = resolve(import.meta.dirname, '..');
const mimeTypes = { svg: 'image/svg+xml', woff2: 'font/woff2', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };

// Production remains a normal multi-page build. A separate single-entry build
// gives portable viewers one inline script per page, without shared JS imports.
async function standalone(entry, directory) {
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
  for (const path of new Set([...js.matchAll(/\/images\/[\w.-]+\.(?:svg|png|jpe?g|webp)/g)].map((match) => match[0]))) js = js.replaceAll(path, await embed(path));
  html = html.replace(scriptTag[0], '');
  // Callbacks preserve literal replacement tokens such as $& in compiled JS.
  html = html.replace(styleTag[0], () => `<style>${css}</style>`);
  const favicon = await embed('/favicon.svg');
  html = html.replace('href="/favicon.svg"', () => `href="${favicon}"`);
  return html.replace('</body>', () => `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>\n</body>`);
}

const home = await standalone('index.html', 'portable-home');
const secondary = await standalone('redesign/index.html', 'portable-redesign');
// Keep real navigation in the deployed site. In a serverless/sandboxed viewer,
// secondary pages run in an isolated full-window frame with embedded assets.
// The home DOM remains intact so its approved interactions and scroll survive.
const navigation = `
(() => {
  const secondary = ${JSON.stringify(secondary).replace(/</g, '\\u003c')};
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
    const bridge = '<script>document.addEventListener("click",function(event){const link=event.target.closest("a");const path=link&&link.getAttribute("href");if(path&&(path.startsWith("/redesign/")||path.startsWith("/#"))){event.preventDefault();parent.postMessage({type:"portfolio-route",path:path},"*");}});<\\/script>';
    frame.srcdoc = secondary.replace('<head>', '<head>' + context).replace('</body>', () => bridge + '</body>');
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
