import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const directoryRoutes = new Set(['/redesign', '/redesign/family-center', '/redesign/tangle', '/redesign/monami']);
function canonicalDirectoryRoutes(server) {
  server.middlewares.use((request, response, next) => {
    const url = new URL(request.url, 'http://vite.local');
    if (!directoryRoutes.has(url.pathname)) return next();
    response.writeHead(308, { Location: `${url.pathname}/${url.search}` });
    response.end();
  });
}

export default defineConfig({
  plugins: [{ name: 'directory-page-routes', configureServer: canonicalDirectoryRoutes, configurePreviewServer: canonicalDirectoryRoutes }],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        redesign: resolve(import.meta.dirname, 'redesign/index.html'),
        familyCenter: resolve(import.meta.dirname, 'redesign/family-center/index.html'),
        tangle: resolve(import.meta.dirname, 'redesign/tangle/index.html'),
        monami: resolve(import.meta.dirname, 'redesign/monami/index.html'),
      },
    },
  },
});
